# Leave Management System

A simple academic project using Node.js, Express, MongoDB, Mongoose, HTML, CSS and JavaScript.

## Live Demo

[Open Leave Management System](https://leave-management-kjao.vercel.app/)

## Features
- User registration with email validation
- Login using registered email (demo only; no password authentication)
- View casual and medical leave balances
- Apply for casual or medical leave
- Refresh leave balance

## Folder Structure
```text
leave-management-system/
├── config/db.js
├── models/User.js
├── routes/leaveRoutes.js
├── public/index.html
├── public/app.js
├── public/style.css
├── .env.example
├── .gitignore
├── app.js
└── package.json
```

## Run Locally
1. Copy `.env.example` to `.env`.
2. Set `MONGO_URI` to your local MongoDB or Atlas connection string.
3. Run `npm install`.
4. Run `npm start`.
5. Open http://localhost:5050.

## API Routes
- POST /api/register
- POST /api/login
- GET /api/leave-balance/:id
- POST /api/apply-leave/:id
- GET /api/health

## Technologies Used
- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MongoDB
- Mongoose

## Notes
- This is a learning/demo project. Login is email-only and is not secure for real-world use. Add password hashing and proper authentication before production use.
- Applying for leave deducts the requested days from the selected leave balance.
- Never commit `.env` or share your MongoDB password.
- On Render, set `MONGO_URI`; Render supplies `PORT` automatically.
