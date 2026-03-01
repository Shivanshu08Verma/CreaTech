"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Html, Grid, Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";
import { ShieldCheck, Terminal, Target, BrainCircuit, CloudLightning, Layers, CheckCircle2, ChevronRight } from "lucide-react";

const CameraController = ({ viewMode }: { viewMode: string }) => {
  useFrame((state) => {
    const targetPos = new THREE.Vector3();
    if (viewMode === "3D") targetPos.set(20, 10, 20);
    if (viewMode === "PLAN") targetPos.set(0, 35, 0);
    if (viewMode === "ELEV") targetPos.set(35, 0, 0);
    state.camera.position.lerp(targetPos, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};
const DeepWaterFoundation = ({ status, drift }: { status: string, drift: number }) => {
  const isFault = status === "FAULT" || status === "HURRICANE";
  const isFixed = status === "RESOLVED";
  const tilt = isFault || isFixed ? drift * 0.01 : 0;

  const piles = useMemo(() => [[-3, -15, -2], [0, -15, -2], [3, -15, -2], [-3, -15, 2], [0, -15, 2], [3, -15, 2]], []);

  return (
    <group rotation={[0, 0, tilt]} position={[0, 0, 0]}>
      <Grid infiniteGrid fadeDistance={50} position={[0, -10, 0]} sectionColor="#1e293b" cellColor="#0f172a" />
      <Html position={[-8, -10, 0]} className="pointer-events-none">
         <div className="text-cyan-800 text-[8px] font-mono tracking-widest bg-black/50 px-1">-40.0 SEAFLOOR DATUM</div>
      </Html>
      {piles.map((pos, idx) => (
        <group key={`pile-${idx}`} position={new THREE.Vector3(...pos)}>
          <Cylinder args={[0.6, 0.6, 20, 16]}><meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.3} /></Cylinder>
        </group>
      ))}
      <Box args={[10, 2, 7]} position={[0, -4, 0]}><meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.6} /></Box>
      <Box args={[3, 16, 3]} position={[0, 5, 0]}><meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.4} /></Box>
      <Box args={[20, 1, 6]} position={[0, 13.5, 0]}><meshStandardMaterial color="#38bdf8" wireframe transparent opacity={0.8} /></Box>
      {isFault && (
        <group position={[0, -10, 0]}>
          <Cylinder args={[6, 0.1, 4, 32]}><meshStandardMaterial color="#FF003C" wireframe transparent opacity={0.5} /></Cylinder>
          <Html position={[4, 2, 0]} className="pointer-events-none">
            <div className="bg-[#FF003C]/20 border border-[#FF003C] text-[8px] text-[#FF003C] px-2 py-1 font-bold animate-pulse">SCOUR EROSION: -{drift.toFixed(1)}m</div>
          </Html>
        </group>
      )}
      {isFixed && (
        <group position={[0, -9.5, 0]}>
          <Cylinder args={[7, 7, 2, 32]}><meshStandardMaterial color="#00FF80" wireframe transparent opacity={0.6} /></Cylinder>
          <Html position={[5, 2, 0]} className="pointer-events-none">
            <div className="bg-[#00FF80]/20 border border-[#00FF80] text-[8px] text-[#00FF80] px-2 py-1 font-bold">20-100kg RIPRAP DEPLOYED</div>
          </Html>
        </group>
      )}
    </group>
  );
};

const HighRise = ({ status, drift }: { status: string, drift: number }) => {
  const isFault = status === "FAULT" || status === "HURRICANE";
  const isFixed = status === "RESOLVED";

  const lines = useMemo(() => {
    const segments: THREE.Vector3[][] = [];
    for (let y = 0; y <= 6; y++) {
      for (let x = -3; x <= 3; x+=3) {
        for (let z = -3; z <= 3; z+=3) {
          const shiftX = y >= 3 ? drift * 0.15 : 0;
          const pt = new THREE.Vector3(x + shiftX, y * 3, z);
          if (y < 6) segments.push([pt, new THREE.Vector3(x + (y + 1 >= 3 ? drift * 0.15 : 0), (y + 1) * 3, z)]);
          if (x < 3) segments.push([pt, new THREE.Vector3(x + 3 + shiftX, y * 3, z)]);
          if (z < 3) segments.push([pt, new THREE.Vector3(x + shiftX, y * 3, z + 3)]);
        }
      }
    }
    return segments;
  }, [drift]);

  return (
    <group position={[0, -6, 0]}>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color={(pts[0].y >= 9 && isFault) ? "#FF003C" : "#38bdf8"} lineWidth={(pts[0].y >= 9 && isFault) ? 2 : 1} transparent opacity={0.4} />
      ))}
      {isFixed && <Line points={[new THREE.Vector3(-3, 6, 3), new THREE.Vector3(-3 + drift*0.15, 12, 3)]} color="#00FF80" lineWidth={4} />}
    </group>
  );
};

const Tunnel = ({ status, drift }: { status: string, drift: number }) => {
  const isFault = status === "FAULT" || status === "HURRICANE";
  const isFixed = status === "RESOLVED";

  const rings = useMemo(() => {
    const segments: THREE.Vector3[][] = [];
    for (let r = 0; r < 8; r++) {
      const pz = r * 2 - 8;
      const rad = r === 4 ? 5 - (drift * 0.05) : 5;
      for (let s = 0; s < 24; s++) {
        const t1 = (s / 24) * Math.PI * 2; const t2 = ((s + 1) / 24) * Math.PI * 2;
        segments.push([new THREE.Vector3(Math.cos(t1)*rad, Math.sin(t1)*rad, pz), new THREE.Vector3(Math.cos(t2)*rad, Math.sin(t2)*rad, pz)]);
      }
    }
    return segments;
  }, [drift]);

  return (
    <group>
      {rings.map((pts, i) => <Line key={i} points={pts} color={isFault && pts[0].z === 0 ? "#FF003C" : "#38bdf8"} lineWidth={1} transparent opacity={0.4} />)}
      {isFixed && <Line points={[new THREE.Vector3(-4, -4, 0), new THREE.Vector3(4, 4, 0)]} color="#00FF80" lineWidth={4} />}
    </group>
  );
};

const RLScheduler = ({ schedule }: { schedule: string }) => {
  return (
    <div className="bg-[#050810] border-t border-[#1e293b] h-32 p-4 flex flex-col text-[9px] uppercase tracking-widest text-slate-400">
      <div className="flex justify-between mb-2 text-[#00F0FF]">
        <span>Layer 6: Reinforcement Learning Scheduler (Stable-Baselines3)</span>
        <span>Reward: +0.847 | Episodes: 12,847 | <span className="text-[#FF003C]">Conflicts: {schedule === 'HALTED' ? 1 : 0}</span></span>
      </div>
      <div className="flex-1 relative border-l border-[#1e293b] ml-16">
        <div className="absolute -left-16 top-2">FOUNDATION</div>
        <div className="absolute -left-16 top-8">HEAVY EQUIP</div>
        <div className="absolute -left-16 top-14">LABOR ALLOC</div>
        
        <div className="absolute top-1 left-4 w-32 h-4 bg-slate-800 rounded flex items-center px-2">PHASE 1 ✓</div>
        
        {schedule === "ACTIVE" && (
          <>
            <div className="absolute top-1 left-40 w-48 h-4 bg-[#00F0FF]/30 border border-[#00F0FF] text-[#00F0FF] rounded flex items-center px-2">POUR PILE CAP</div>
            <div className="absolute top-14 left-4 w-64 h-4 bg-slate-800 rounded flex items-center px-2">CREW ALPHA ACTIVE</div>
          </>
        )}
        {schedule === "HALTED" && (
          <>
            <div className="absolute top-1 left-40 w-16 h-4 bg-[#FF003C] text-white rounded flex items-center px-2 animate-pulse">HOLD</div>
            <div className="absolute top-8 left-40 w-32 h-4 bg-[#FF003C]/30 border border-[#FF003C] text-[#FF003C] rounded flex items-center px-2">CRANES GROUNDED</div>
          </>
        )}
        {schedule === "RE_SEQUENCED" && (
          <>
            <div className="absolute top-1 left-40 w-16 h-4 bg-[#1e293b] text-slate-500 rounded flex items-center px-2 line-through">HOLD</div>
            <div className="absolute top-1 left-64 w-48 h-4 bg-[#00FF80]/30 border border-[#00FF80] text-[#00FF80] rounded flex items-center px-2">AI REDESIGN PROTOCOL</div>
            <div className="absolute top-14 left-64 w-48 h-4 bg-[#00F0FF]/20 border border-[#00F0FF] rounded flex items-center px-2">REPAIR CREW DISPATCHED</div>
          </>
        )}
      </div>
    </div>
  );
};

export default function CPEC_Dashboard() {
  const [telemetry, setTelemetry] = useState({ 
    project_type: "MARINE_BRIDGE", status: "NOMINAL", drift_mm: 0, integrity: 91.4, wind_kmh: 12.4, schedule_state: "ACTIVE", 
    ml_data: { risk_class: "LOW RISK", risk_probability: 0.0, thickness_mm: 0, stress_reduction: 0, action_plan: [] as string[] }
  });
  
  const [viewMode, setViewMode] = useState("3D"); 
  const [logs, setLogs] = useState<{ time: string; msg: string; type: "info" | "warn" | "success" }[]>([{ time: new Date().toLocaleTimeString(), msg: "Booting A-C3DES Process Intelligence...", type: "info" }]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const prevStatusRef = useRef(telemetry.status);

  const addLog = useCallback((msg: string, type: "info" | "warn" | "success") => {
    setLogs((prev) => [...prev, { time: new Date().toLocaleTimeString("en-US", { hour12: false }), msg, type }]);
  }, []);

  useEffect(() => {
    const ws = new WebSocket("wss://https://createch-ru18.onrender.com/ws/telemetry");
    ws.onmessage = (event) => { try { setTelemetry(JSON.parse(event.data)); } catch {} };
    ws.onerror = () => addLog("CRITICAL: Backend Offline.", "warn");
    return () => ws.close();
  }, [addLog]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (prevStatusRef.current !== telemetry.status) {
        if (telemetry.status === "FAULT") addLog("Anomaly Detected. Layer 5 Risk Model Triggered.", "warn");
        if (telemetry.status === "RESOLVED") addLog("Generative Protocol dispatched to on-site workforce.", "success");
        prevStatusRef.current = telemetry.status;
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [telemetry.status, addLog]);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const apiCall = async (endpoint: string) => { try { await fetch(`https://createch-ru18.onrender.com/api/${endpoint}`, { method: "POST" }); } catch {} };

  const canSimulate = telemetry.status === "NOMINAL" || telemetry.status === "RESOLVED";
  const isFault = telemetry.status === "FAULT" || telemetry.status === "HURRICANE";
  const isFixed = telemetry.status === "RESOLVED";

  return (
    <div className="h-screen bg-[#050B14] text-slate-300 font-mono text-[10px] flex flex-col overflow-hidden select-none">
      
      <header className="flex justify-between items-center border-b border-[#1e293b] p-2 bg-[#0a0f18]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#00F0FF] font-bold text-sm tracking-widest border border-[#00F0FF]/30 px-2 py-1 bg-[#00F0FF]/10">
            <BrainCircuit size={14} /> A-C3DES LAYER 7
          </div>
          <span className="text-slate-500 tracking-widest uppercase">Execution Interface & Human Governance</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-[#0f172a] rounded border border-slate-700 overflow-hidden">
            <button onClick={() => apiCall('set_context?project_type=MARINE_BRIDGE')} className={`px-4 py-1 ${telemetry.project_type === "MARINE_BRIDGE" ? "bg-[#00F0FF]/20 text-[#00F0FF]" : "text-slate-500 hover:text-slate-300"}`}>Bridge</button>
            <button onClick={() => apiCall('set_context?project_type=BUILDING')} className={`px-4 py-1 border-l border-slate-700 ${telemetry.project_type === "BUILDING" ? "bg-[#00F0FF]/20 text-[#00F0FF]" : "text-slate-500 hover:text-slate-300"}`}>Building</button>
            <button onClick={() => apiCall('set_context?project_type=TUNNEL')} className={`px-4 py-1 border-l border-slate-700 ${telemetry.project_type === "TUNNEL" ? "bg-[#00F0FF]/20 text-[#00F0FF]" : "text-slate-500 hover:text-slate-300"}`}>Tunnel</button>
          </div>
          <button onClick={() => apiCall('reset')} className="text-slate-500 hover:text-slate-300 px-3 py-1 border border-slate-700 rounded transition-colors">Reset Twin</button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-2 p-2 min-h-0">

        <div className="col-span-3 flex flex-col gap-3">
          <div className="bg-[#0A101A] border border-[#1e293b] p-3 flex flex-col h-full">
            <h2 className="text-[#00F0FF] uppercase tracking-widest mb-4 border-b border-[#1e293b] pb-2 flex items-center gap-2"><Target size={12}/> Layer 5: ML Risk Engine</h2>
            
            <div className="mb-4">
               <div className="text-slate-500 text-[8px] uppercase mb-1">Logistic Regression Output</div>
               <div className={`p-3 border font-bold uppercase tracking-widest text-[12px] flex justify-between ${
                 telemetry.ml_data.risk_class === "HIGH RISK" ? 'bg-[#FF003C]/10 border-[#FF003C] text-[#FF003C] animate-pulse' : 'bg-[#00FF80]/10 border-[#00FF80] text-[#00FF80]'
               }`}>
                 <span>{telemetry.ml_data.risk_class}</span>
                 <span>{telemetry.ml_data.risk_probability}%</span>
               </div>
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 p-2 bg-[#0f172a] border border-[#00F0FF]/30 text-[#00F0FF] rounded"><Layers size={12} /> {telemetry.project_type} ASSET</div>
              <div className={`ml-4 p-2 rounded border ${isFault ? "bg-[#FF003C]/10 border-[#FF003C]/50 text-[#FF003C]" : isFixed ? "bg-[#00FF80]/10 border-[#00FF80]/50 text-[#00FF80]" : "border-slate-800 text-slate-400"}`}>
                <div className="flex justify-between items-center">
                  <span>Critical Node Segment</span>
                  {isFault && <span className="bg-[#FF003C] text-white text-[8px] px-1 rounded animate-pulse">ERR</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 text-slate-500"><CheckCircle2 size={12} className="text-[#00FF80]" /> Model Sync Complete</div>
            </div>

            <div className="mt-auto bg-[#050810] border border-[#1e293b] rounded p-2 h-40 flex flex-col">
                <h3 className="text-slate-500 text-[8px] mb-2 uppercase tracking-widest border-b border-[#1e293b] pb-1 flex items-center gap-1"><Terminal size={10} /> IoT Sensor Bus</h3>
                <div className="overflow-y-auto flex-1 space-y-1 text-[8px]">
                  {logs.map((log, i) => (
                    <div key={i} className={`font-mono flex gap-1 ${log.type === "warn" ? "text-[#FF003C]" : log.type === "success" ? "text-[#00FF80]" : "text-slate-400"}`}>
                      <span className="opacity-50 mt-0.5">●</span><div>{log.msg}</div>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
            </div>
          </div>
        </div>

        <div className="col-span-6 bg-[#0A101A] border border-[#1e293b] relative flex flex-col shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
          <div className="absolute top-3 left-3 z-10 text-slate-400 uppercase tracking-widest bg-black/50 p-2 rounded">
            LAYER 3: GEOMETRY SYNCHRONIZATION TWIN
          </div>
          
          <div className="absolute top-3 right-3 z-10 flex gap-1">
             {["3D", "PLAN", "ELEV"].map(mode => (
               <button key={mode} onClick={() => setViewMode(mode)} 
                 className={`px-3 py-1 rounded text-[8px] font-bold transition-colors ${viewMode === mode ? 'bg-[#00F0FF]/20 border border-[#00F0FF] text-[#00F0FF]' : 'border border-slate-700 text-slate-500'}`}>
                 {mode}
               </button>
             ))}
          </div>
          
          <div className="flex-1 w-full h-full cursor-move">
            <Canvas>
              <OrbitControls makeDefault enablePan={true} enableZoom={true} />
              <ambientLight intensity={0.5} />
              {telemetry.project_type === "MARINE_BRIDGE" && <DeepWaterFoundation status={telemetry.status} drift={telemetry.drift_mm} />}
              {telemetry.project_type === "BUILDING" && <HighRise status={telemetry.status} drift={telemetry.drift_mm} />}
              {telemetry.project_type === "TUNNEL" && <Tunnel status={telemetry.status} drift={telemetry.drift_mm} />}
              <CameraController viewMode={viewMode} />
            </Canvas>
          </div>

          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 pointer-events-none">
             {canSimulate && (
                <>
                  <button onClick={() => apiCall('trigger_fault')} className="pointer-events-auto bg-[#FF003C]/20 border border-[#FF003C] text-[#FF003C] px-6 py-2 uppercase tracking-widest font-bold hover:bg-[#FF003C]/40 backdrop-blur transition-colors">
                    Simulate Geometry Drift
                  </button>
                  <button onClick={() => apiCall('simulate_hurricane')} className="pointer-events-auto bg-[#f59e0b]/20 border border-[#f59e0b] text-[#f59e0b] px-6 py-2 uppercase tracking-widest font-bold hover:bg-[#f59e0b]/40 backdrop-blur flex items-center gap-2">
                    <CloudLightning size={12}/> Extreme Weather Load
                  </button>
                </>
             )}
          </div>
        </div>

        <div className="col-span-3 flex flex-col gap-2">

          <div className="bg-[#0A101A] border border-[#1e293b] p-3">
             <h2 className="text-[#00F0FF] uppercase tracking-widest mb-4 border-b border-[#1e293b] pb-2">Random Forest Regression</h2>
             <div className="grid grid-cols-2 gap-2 mb-2">
               <div className="bg-[#0f172a] p-2 border border-slate-800 rounded">
                  <div className="text-[8px] text-slate-500 uppercase mb-1">Thickness / Mass</div>
                  <div className={`text-xl font-bold ${telemetry.ml_data.thickness_mm > 0 ? 'text-[#00FF80]' : 'text-slate-500'}`}>
                    {telemetry.ml_data.thickness_mm > 0 ? telemetry.ml_data.thickness_mm : '--'} <span className="text-[8px]">UNIT</span>
                  </div>
               </div>
               <div className="bg-[#0f172a] p-2 border border-slate-800 rounded">
                  <div className="text-[8px] text-slate-500 uppercase mb-1">Stress Reduced</div>
                  <div className={`text-xl font-bold ${telemetry.ml_data.stress_reduction > 0 ? 'text-[#00F0FF]' : 'text-slate-500'}`}>
                    {telemetry.ml_data.stress_reduction > 0 ? `-${telemetry.ml_data.stress_reduction}` : '--'} <span className="text-[8px]">%</span>
                  </div>
               </div>
             </div>
          </div>

          <div className="bg-[#0A101A] border border-[#1e293b] p-3 flex-1 flex flex-col overflow-hidden">
             <h2 className="text-[#00F0FF] uppercase tracking-widest mb-3 border-b border-[#1e293b] pb-2 flex items-center gap-2">
                <Target size={12}/> AI Execution Protocol
             </h2>
             
             <div className="flex-1 overflow-y-auto">
               {telemetry.ml_data.action_plan && telemetry.ml_data.action_plan.length > 0 ? (
                 <div className="space-y-3 pr-2">
                    {telemetry.ml_data.action_plan.map((step, index) => {
                       const [verb, ...rest] = step.split(':');
                       return (
                         <div key={index} className={`flex gap-2 p-2 border rounded ${isFixed ? 'border-[#00FF80]/30 bg-[#00FF80]/5' : 'border-[#f59e0b]/30 bg-[#f59e0b]/5'}`}>
                           <ChevronRight size={14} className={isFixed ? "text-[#00FF80]" : "text-[#f59e0b]"} />
                           <div className="text-[9px] leading-relaxed">
                             <span className={`font-bold ${isFixed ? 'text-[#00FF80]' : 'text-[#f59e0b]'}`}>{verb}:</span> {rest.join(':')}
                           </div>
                         </div>
                       );
                    })}
                 </div>
               ) : (
                 <div className="h-full flex items-center justify-center text-slate-600 uppercase tracking-widest text-[9px] text-center p-4 border border-slate-800 border-dashed rounded">
                   Awaiting structural anomaly to generate execution steps.
                 </div>
               )}
             </div>

             <div className="mt-4 pt-3 border-t border-[#1e293b]">
               {isFault ? (
                 <button onClick={() => apiCall('recalibrate')} className="w-full bg-linear-to-r from-[#FF003C] to-[#ff4069] text-white py-3 uppercase tracking-widest font-bold hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,0,60,0.5)]">
                   Dispatch Protocol to Site Crew
                 </button>
               ) : isFixed ? (
                 <div className="w-full border border-[#00FF80] bg-[#00FF80]/10 text-[#00FF80] py-3 text-center uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                   <ShieldCheck size={14}/> WORKFORCE DISPATCHED
                 </div>
               ) : null}
             </div>
          </div>
          
        </div>
      </div>

      <RLScheduler schedule={telemetry.schedule_state} />
    </div>
  );
}