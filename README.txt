# Team Task Manager

This is a Full-Stack Team Task Manager application built to satisfy the requirements of the assessment.

## Features
- Authentication (Signup/Login)
- Role-based Access Control (Admin/Member)
- Project & Team Management
- Task Creation, Assignment, and Status Tracking
- Comprehensive Dashboard

## Tech Stack
- Frontend: React (Vite), Tailwind CSS, React Router, Axios
- Backend: Node.js, Express, Sequelize, SQLite
- Monorepo structure optimized for a single-service deployment on Railway.

## Deployment on Railway
1. Push this entire folder (`team-task-manager`) to a new GitHub repository.
2. Go to [Railway](https://railway.app/).
3. Click "New Project" -> "Deploy from GitHub repo".
4. Select your newly created repository.
5. Railway will automatically detect the `package.json` in the root folder, run `npm install`, then `npm run build`, and finally `npm start`.
6. Once deployed, Railway will generate a Live URL for your app. 

## Final Submission Instructions
1. Live Application URL: [Paste your Railway generated URL here]
2. GitHub Repository Link: [Paste your GitHub repo link here]
3. Upload this `README.txt` file into the file upload section of your form.

## Notes for Evaluators
- The app uses SQLite for ease of deployment on Railway without requiring a separate database plugin, satisfying the "Database (SQL/NoSQL)" requirement in a zero-config way.
- The `Admin` role can create projects and assign tasks.
- The `Member` role can view their assigned tasks and update the task status.
