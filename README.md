# A-C3DES™ (Adaptive Cyber-Physical Closed-Loop Dynamic Engineering System)

A-C3DES is a predictive digital twin and AI-driven control system for critical construction infrastructure. 

Instead of waiting weeks for engineers to manually redesign a structure after a physical fault (like foundation settling or wind shear), this system uses Machine Learning to instantly calculate the required structural fix and visualizes it on a live 3D web dashboard.

## 🚀 Key Features

* **Real-Time 3D Digital Twin:** Procedurally generates complex structures (Bridges, Skyscrapers, Tunnels) and visualizes physical deformations in real-time using Three.js.
* **Predictive Risk AI:** Uses a Scikit-Learn Logistic Regression model to calculate the probability of catastrophic structural failure based on live telemetry.
* **Generative Prescriptive AI:** Uses a Random Forest Regressor to mathematically calculate the exact thickness of steel or tons of material needed to fix a fault.
* **Automated Task Scheduling:** Translates the AI's mathematical fix into a step-by-step human action plan and re-sequences the workforce Gantt chart to eliminate idle capital.
* **Low-Latency Telemetry:** Streams simulated IoT sensor data (wind speed, geometric drift) using high-speed WebSockets.

## 💻 Tech Stack

**Frontend (Execution Interface & 3D Twin):**
* Next.js (React)
* Three.js & React-Three-Fiber (WebGL 3D Rendering)
* Tailwind CSS
* Lucide React (Icons)

**Backend (Process Intelligence Engine):**
* Python 3
* FastAPI (REST API & WebSockets)
* Scikit-Learn (Machine Learning Models)
* NumPy (Data Processing)

## 🛠️ How to Run Locally

To run this project on your local machine, you will need two terminal windows open: one for the Python backend and one for the Next.js frontend.

### 1. Start the Python Backend
Open a terminal, navigate to the backend folder, and run:
```bash
cd ac3des-backend
# Create and activate a virtual environment (optional but recommended)
python -m venv venv
source venv/Scripts/activate  # On Mac/Linux use: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
The backend will now be running on http://localhost:8000
```

### 2. Start the Next.js Frontend
Open a second terminal, navigate to the frontend folder, and run:
```bash
cd ac3des-frontend

# Install Node modules
npm install

# Start the development server
npm run dev
The frontend will now be running on http://localhost:3000
```

### 🌐 Deployment
This project is built to be easily deployed to modern cloud infrastructure:

Backend: Ready to be deployed as a Web Service on platforms like Render or Heroku.

Frontend: Optimized for edge deployment via Vercel.