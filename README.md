## SME BOOST: AN LLM-POWERED MOBILE ASSISTANT FOR GHANAIAN ENTREPRENEURS. GROUP 11D
## PROJECT SUPERVISOR: PROF. PETER APPIAHENE

SME Boost GH is a mobile application designed for Ghanaian entrepreneurs and small business owners. It provides guided workflows to simplify technical and business tasks such as business plan drafting, marketing content generation, and professional email composition.

## Features
- Business Plan Drafting: Easy, step-by-step guidance for planning out a new business.
- Marketing Content Generation: Auto-generate content for products and services.
- Professional Email Composition: Quickly draft formal emails for business communications.

## Tech Stack
- Frontend: React Native (Expo), NativeWind (TailwindCSS)
- Backend: Python (FastAPI/Flask)
- Database/Auth: Firebase

## Local Setup Instructions

To run this project locally, you will need Node.js and Python installed. Since sensitive API keys are not uploaded to GitHub, you will need to add them locally before running the app.

### 1. Backend Setup (Python)
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend

## 2. Create and activate a virtual environment:
python -m venv venv
source venv/Scripts/activate  # On Windows
# source venv/bin/activate    # On Mac/Linux

## 3. Install the dependencies:
pip install -r requirements.txt

## 4. Important Environment Setup:
- Create a .env file in the backend folder and add the necessary environment variables.
- Place your firebase-service-account.json file inside the backend folder.

## 5. Start the backend server:
uvicorn main:app --reload
OR python main.py (depending on your setup)


## Frontend Setup (React Native / Expo)
## 1. Open a new terminal and navigate to the app folder:
cd app

## 2. npm install

## 3. Important Environment Setup:
- Create a .env file in the app folder and add the required environment variables (e.g., Firebase config keys).

## 4. Start the Expo development server:
npx expo start

## 5. Scan the QR code with the Expo Go app on your phone, or press a to run on an Android emulator, or i for an iOS simulator.
