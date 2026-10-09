# 🚗 CampusRide – RCPIT Shirpur Campus Mobility Platform

A web platform built specifically for students and staff of **R. C. Patel Institute of Technology (RCPIT), Shirpur** to coordinate low-cost, safe, peer-to-peer campus transportation.

---

## 🌟 Key Features

1. **Peer Ride Sharing (Carpool / Bike-pool)**
   - Share empty seats between RCPIT Campus and Shirpur landmarks.
   - Built-in route fare calculation using the **₹12 / KM fuel-sharing standard**.
   - Driver controls seat requests: review applicant details and accept/decline.

2. **Interactive Shirpur Campus Route Map**
   - Embedded route overview connecting RCPIT Main Gate to key destinations:
     - Shirpur Bus Stand (MSRTC) (3.2 KM)
     - Nimzari Naka (1.8 KM)
     - Karwand Naka / Market (2.5 KM)
     - RCPIT Hostels Area (0.8 KM)
     - Mukeshbhai Patel Sports Complex (2.2 KM)
     - Subhash Chowk / Old City (2.9 KM)
   - One-click route autofill into ride creation forms.

3. **Shirpur MSRTC Bus Stand Live Timetable**
   - Accurate departure schedules, platform numbers, and bus fares for:
     - Dhule (Ordinary & Asian Semi-Luxury)
     - Jalgaon, Nashik (CBS & Express), Pune (Night Sleeper & Shivshahi), Indore, Shahada, Nandurbar, Amalner, Chopda.

4. **Dual Institutional Verification**
   - Direct verification for `@rcpit.ac.in` email holders.
   - PRN (Permanent Registration Number) validation for personal email users.
   - AI & ML, Computer, IT, Data Science, Mechanical, Civil, and E&TC departments supported.

5. **Dedicated Admin Moderation Console**
   - Real-time monitor tracking active users and who is doing ride sharing.
   - Inspect co-passengers and seat bookings.
   - Verify/revoke student PRN accounts.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React, React Router v6
- **Backend:** Node.js, Express.js, REST API
- **Database:** MongoDB, Mongoose ORM
- **Authentication:** JWT (JSON Web Tokens), bcryptjs password hashing

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port 27017

### 2. Clone the Repository
```bash
git clone https://github.com/dipak-kachave/CampusRide.git
cd CampusRide
```

### 3. Backend Setup
```bash
cd server
npm install
# Ensure .env has MONGO_URI=mongodb://127.0.0.1:27017/campusride and PORT=5000
npm start
```

### 4. Frontend Setup
```bash
cd ../client
npm install
npm run dev
```

The application will be live at:
- **Frontend App:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

---

## 📜 License
Developed for academic purposes at RCPIT Shirpur.
