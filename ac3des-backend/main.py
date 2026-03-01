import asyncio
import random
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="A-C3DES Process Intelligence Engine")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

class StructuralAI:
    def __init__(self):
        print("Booting Layer 5 ML Models...")
        self.generative_model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.risk_model = LogisticRegression(random_state=42)
        self.train_models()

    def train_models(self):
        X_train = np.random.rand(2000, 3) * [50, 200, 100]
        thickness = X_train[:, 0] * 12.5 + X_train[:, 1] * 0.5
        stress_red = np.clip(100 - (X_train[:, 0] * 1.2), 30, 95)
        self.generative_model.fit(X_train, np.column_stack([thickness, stress_red]))
        y_risk = ((X_train[:, 0] > 15) | (X_train[:, 1] > 100)).astype(int)
        self.risk_model.fit(X_train, y_risk)
        print("ML Models Trained and Ready.")

    def run_inference(self, drift, wind, equipment, project_type):
        input_vector = [[drift, wind, equipment]]
        
        risk_prob = self.risk_model.predict_proba(input_vector)[0][1] * 100
        risk_class = "HIGH RISK" if risk_prob > 60 else "LOW RISK"

        gen_output = self.generative_model.predict(input_vector)[0]
        thickness_mm = round(gen_output[0], 1)
        stress_reduction = round(gen_output[1], 1)

        action_plan = []
        if thickness_mm > 0:
            if project_type == "BUILDING":
                action_plan = [
                    f"EVACUATE: Clear personnel from Floors 3-5 immediately.",
                    f"FABRICATE: Procure {thickness_mm}mm thick heavy H-beam steel.",
                    f"INSTALL: Weld Asymmetric Exoskeleton to exterior nodes.",
                    f"VERIFY: Confirm {stress_reduction}% load stress reduction via laser scan."
                ]
            elif project_type == "MARINE_BRIDGE":
                tons_riprap = round(thickness_mm * 10)
                action_plan = [
                    f"MOBILIZE: Dispatch marine barges and cranes to Pier 2.",
                    f"DEPLOY: Drop {tons_riprap} Tons of 100kg riprap boulders into scour hole.",
                    f"INSPECT: Deploy underwater ROV to confirm seabed stabilization.",
                    f"VERIFY: Confirm {stress_reduction}% hydrodynamic stress reduction."
                ]
            elif project_type == "TUNNEL":
                action_plan = [
                    f"HALT: Stop TBM boring advance immediately.",
                    f"FABRICATE: Form {thickness_mm}mm thick post-tensioned steel lattice struts.",
                    f"INSTALL: Bolt struts internally at Segment SR-041.",
                    f"VERIFY: Confirm convergence halted and {stress_reduction}% stress relieved."
                ]

        return {
            "risk_class": risk_class,
            "risk_probability": round(risk_prob, 1),
            "thickness_mm": thickness_mm,
            "stress_reduction": stress_reduction,
            "action_plan": action_plan
        }

ai_engine = StructuralAI()

class SystemState:
    def __init__(self):
        self.project_type = "MARINE_BRIDGE"
        self.status = "NOMINAL" 
        self.drift_mm = 0.0
        self.wind_kmh = 12.4
        self.integrity = 99.8
        self.equipment_util = 88.0
        self.schedule_state = "ACTIVE"
        self.ml_data = ai_engine.run_inference(0, 12.4, 88, "MARINE_BRIDGE")

state = SystemState()

async def simulation_loop():
    while True:
        if state.status == "FAULT":
            if state.drift_mm < 45.0: state.drift_mm += random.uniform(1.0, 3.0)
            state.integrity = max(45.2, state.integrity - random.uniform(1.0, 2.5))
            state.equipment_util = random.uniform(20, 40)
            state.schedule_state = "HALTED"
            
        elif state.status == "HURRICANE":
            if state.wind_kmh < 195.0: state.wind_kmh += random.uniform(5.0, 15.0)
            if state.drift_mm < 25.0: state.drift_mm += random.uniform(0.5, 1.5)
            state.integrity -= random.uniform(1.0, 2.0)
            state.schedule_state = "HALTED"
            
        elif state.status == "NOMINAL":
            state.drift_mm = max(0.0, state.drift_mm - random.uniform(0.5, 1.5))
            state.wind_kmh = max(5.0, state.wind_kmh - random.uniform(2.0, 5.0))
            state.integrity = min(99.8, state.integrity + random.uniform(0.5, 1.0))
            state.equipment_util = random.uniform(85, 95)
            state.schedule_state = "ACTIVE"
            
        elif state.status == "RESOLVED":
            state.integrity = min(99.4, state.integrity + random.uniform(1.0, 3.0))
            state.schedule_state = "RE_SEQUENCED"
          
        state.ml_data = ai_engine.run_inference(state.drift_mm, state.wind_kmh, state.equipment_util, state.project_type)
        
        await asyncio.sleep(0.5)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_loop())

@app.websocket("/ws/telemetry")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            await websocket.send_json({
                "project_type": state.project_type,
                "status": state.status,
                "drift_mm": state.drift_mm,
                "wind_kmh": state.wind_kmh,
                "integrity": state.integrity,
                "schedule_state": state.schedule_state,
                "ml_data": state.ml_data
            })
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        pass

@app.post("/api/set_context")
def set_context(project_type: str):
    state.project_type = project_type
    state.status = "NOMINAL"
    state.drift_mm = 0.0
    return {"message": "Success"}

@app.post("/api/trigger_fault")
def trigger_fault():
    state.status = "FAULT"
    return {"message": "Fault injected"}

@app.post("/api/simulate_hurricane")
def simulate_hurricane():
    state.status = "HURRICANE"
    return {"message": "Hurricane simulated"}

@app.post("/api/recalibrate")
def recalibrate():
    state.status = "RESOLVED"
    return {"message": "Recalibrated"}

@app.post("/api/reset")
def reset():
    state.status = "NOMINAL"
    state.drift_mm = 0.0
    state.wind_kmh = 12.4
    return {"message": "Reset"}