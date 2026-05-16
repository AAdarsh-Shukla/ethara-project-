=========================================================
TEAM TASK MANAGER (NEXUSTASKS) - FULL-STACK PROJECT
=========================================================

1. PROJECT OVERVIEW
---------------------------------------------------------
NexusTasks is a professional, full-stack Team Task Manager built to orchestrate team productivity. It features role-based access control (Admin vs Member), advanced Kanban drag-and-drop mechanics, real-time analytics, and a premium "glassmorphism" dark-mode user interface.

This application is fully responsive, container-ready, and configured for seamless deployment on cloud platforms like Railway.

2. TECHNOLOGY STACK
---------------------------------------------------------
* Frontend: React.js (Vite), Tailwind CSS, Framer Motion UI principles, Axios, React Router, React Hot Toast
* Backend: Node.js, Express.js
* Database: SQLite (via Sequelize ORM)
* Authentication: JSON Web Tokens (JWT) & bcryptjs for password hashing

3. KEY FEATURES
---------------------------------------------------------
* Secure Authentication: Signup/Login with password hashing.
* Role-based Access Control: Admin users can create projects and assign tasks; Members can view their tasks and update statuses.
* Advanced Kanban Board: Full drag-and-drop support to move tasks between "To Do", "In Progress", and "Done".
* Enterprise UI/UX: Dark mode, mesh gradients, frosted glass UI components (glassmorphism), dynamic user avatars.
* Project Portfolios: Real-time progress bars calculating the completion percentage of projects.
* Agile Methodologies: Integrated support for Custom Tags, Story Points, and Estimated Hours.
* Advanced Global Search: Command Palette (Cmd+K) style search filtering across titles, descriptions, and tags.
* Data Export & Print Mode: Export task data to CSV or enter Zen/Print mode for distraction-free tracking.

4. LOCAL SETUP INSTRUCTIONS
---------------------------------------------------------
Because this is a Monorepo, we have included a handy shell script to install and run everything simultaneously.

1. Open your terminal in the root directory of the project.
2. Run the initialization script:
   ./run.sh
3. The script will:
   - Install backend dependencies.
   - Install frontend dependencies.
   - Build the React production assets.
   - Start the Express server on Port 5001.
4. Open your browser and navigate to: http://localhost:5001

(Note: The backend is configured to automatically serve the compiled frontend, so you only need to run one server port!)

5. DEPLOYMENT (RAILWAY)
---------------------------------------------------------
This project is pre-configured for 1-click deployment on Railway.app.

1. Connect your GitHub repository to Railway.
2. Railway will automatically detect the `package.json` at the root directory.
3. It will run the root `install` and `build` scripts (which cascade into the frontend folder).
4. Finally, Railway will execute `npm start` which boots the Express server.
5. SQLite is used as a zero-config, serverless database, meaning no external database provisioning is required for the live deployment.

=========================================================
Author: Adarsh Shukla
=========================================================
