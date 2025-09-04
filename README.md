💬 Talk Nest

Talk Nest is a real-time video conferencing and chat platform built with React.js (Vite), Node.js (Express), MongoDB, and Socket.IO.
It allows users to connect through video calls, chat messaging, and meeting management with a modern UI.

✨ Features

🔴 Real-Time Video & Audio Calls (WebRTC + Socket.IO)

💬 Live Chat Messaging inside meeting rooms

🧑‍🤝‍🧑 User Authentication & Authorization (JWT-ready)

🗂 Meeting Creation & History Tracking

🎨 Beautiful & Responsive UI (Material-UI + Framer Motion + Tailwind)


📱 Works across devices (desktop & mobile)

📂 Project Structure
Talk-Nest/
│── Backend/                 # Node.js + Express + Socket.IO backend
│   ├── src/
│   │   ├── controllers/     # Controllers (user, socket manager)
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routes
│   │   ├── app.js           # Entry point
│   │   └── auth.js          # Auth middleware
│   ├── .env                 # Environment variables
│   ├── package.json
│
│── Frontend/                # React.js (Vite) frontend
│   ├── src/
│   │   ├── pages/           # Pages (Home, Authentication, VideoMeet, History, Landing)
│   │   ├── components/      # UI Components (ChatPanel, Controls, VideoComponent)
│   │   ├── contexts/        # React Context (Auth, Socket)
│   │   ├── styles/          # CSS Modules
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/              # Static assets
│   ├── vite.config.js
│   ├── package.json
│
│── README.md

⚙ Tech Stack

Frontend:

React.js (Vite)

Material-UI, Framer Motion, Tailwind CSS

Socket.IO Client


Backend:

Node.js, Express.js

MongoDB + Mongoose

Socket.IO (real-time communication)

JWT Authentication

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/pankeshbhagore/talk-nest.git
cd talk-nest

2️⃣ Install Dependencies
# Frontend
cd Frontend
npm install

# Backend
cd ../Backend
npm install

3️⃣ Setup Environment Variables

Inside Backend/.env:

PORT=8000
MONGO_URI=your_mongodb_connection_string


4️⃣ Run the Project
# Run backend
cd Backend
npm run dev

# Run frontend (in new terminal)
cd ../Frontend
npm run dev


Now open 👉 http://localhost:5173

🛠 Scripts

Backend (Backend/package.json):

npm run dev → Start server with nodemon

npm start → Start server

npm run prod → Run with PM2

Frontend (Frontend/package.json):

npm run dev → Start Vite dev server

npm run build → Build production version

npm run preview → Preview production build

🛠 Future Enhancements

📺 Screen Sharing

📁 File Sharing in Chat


🤝 Contributing

Contributions are welcome!
Fork the repo → Make changes → Open a Pull Request 🚀


👨‍💻 Author

Developed with ❤ by Pankesh Bhagore