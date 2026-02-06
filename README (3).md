
# Smart Attendance and Engagement Tracking System

🚀 **Live Deployment (Frontend)**  
🔗 Vercel Link: https://your-project-name.vercel.app  
> (Replace this link with your actual Vercel deployment URL)

---

## 📌 Project Overview
The **Smart Attendance and Engagement Tracking System** goes beyond traditional attendance systems by tracking **participation, engagement, and consistency**.  
It provides actionable insights using dashboards and analytics to help institutions and organizations improve learning and collaboration outcomes.

---

## 🎯 Domain & Industry Fit
- **Core Domain:** Data Analytics, Application Development  
- **Industry Fit:** EdTech, HRTech  

---

## ✨ Features
- User Authentication (Student / Admin)
- Attendance Tracking (Present / Absent)
- Engagement Tracking (Interactions, activity)
- Engagement Score Calculation
- Consistency Analysis
- Dashboard with Charts & Analytics
- REST API based backend
- Fully runs on **localhost**
- Frontend deployed on **Vercel**

---

## 🛠 Tech Stack

### Frontend
- HTML
- CSS
- JavaScript
- Chart.js
- Deployed on **Vercel**

### Backend
- Node.js
- Express.js

### Database
- MongoDB (Local)

---

## 📂 Project Structure
```
smart-attendance-system/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── config/db.js
│   ├── models/
│   ├── routes/
│   └── controllers/
│
├── frontend/
│   ├── login.html
│   ├── dashboard.html
│   ├── css/
│   └── js/
│
├── .env.example
└── README.md
```

---

## ▶️ How to Run Locally

### 1️⃣ Prerequisites
- Node.js (v16+)
- MongoDB Community Server
- VS Code (recommended)

---

### 2️⃣ Backend Setup
```bash
cd backend
npm install
```

Create `.env` file inside backend:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_attendance
JWT_SECRET=secret123
```

Start backend:
```bash
npm start
```

Backend runs at:
```
http://localhost:5000
```

---

### 3️⃣ Frontend Setup
- Open `frontend` folder in VS Code
- Right-click `login.html`
- Select **Open with Live Server**

Frontend runs at:
```
http://127.0.0.1:5500/login.html
```

---

## 🌐 Vercel Deployment (Frontend)

### Steps:
1. Push project to GitHub
2. Go to https://vercel.com
3. Import GitHub repository
4. Select **frontend** folder as root
5. Build command: (leave empty)
6. Output directory: `/`
7. Deploy

✔ After deployment, update the Vercel link at the top of this README.

---

## 📊 Engagement Score Logic
```
Engagement Score =
(Login Frequency × 0.4) +
(Interactions × 0.4) +
(Consistency × 0.2)
```

---

## 🧠 Use Cases
- Smart classroom monitoring
- Employee engagement tracking
- Learning analytics
- Performance insights

---

## 🚀 Future Enhancements
- Face recognition attendance
- AI-based engagement prediction
- Role-based dashboards
- Cloud database integration

---

## 👨‍💻 Author
Developed as an academic and industry-ready project for **Smart Attendance & Engagement Tracking**.

---

⭐ If you like this project, give it a star on GitHub!
