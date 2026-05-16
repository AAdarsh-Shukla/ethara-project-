const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { sequelize, User, Project, Task } = require('./models');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Middleware to protect routes
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) throw new Error();
    req.user = user;
    next();
  } catch (err) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') return res.status(403).send({ error: 'Access denied.' });
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = await User.create({ name, email, password: hashedPassword, role: role || 'Member' });
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.status(201).send({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ error: 'Invalid login credentials' });
    }
    const token = jwt.sign({ id: user.id }, JWT_SECRET);
    res.send({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/api/users', auth, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    res.send(users);
  } catch (err) {
    res.status(500).send();
  }
});

// --- PROJECT ROUTES ---
app.post('/api/projects', auth, isAdmin, async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, ownerId: req.user.id });
    res.status(201).send(project);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/api/projects', auth, async (req, res) => {
  try {
    const projects = await Project.findAll({ include: [{ model: User, as: 'owner', attributes: ['id', 'name'] }] });
    res.send(projects);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete('/api/projects/:id', auth, isAdmin, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).send();
    await project.destroy();
    res.send({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).send(error);
  }
});

// --- TASK ROUTES ---
app.post('/api/projects/:projectId/tasks', auth, isAdmin, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.projectId);
    if (!project) return res.status(404).send();
    const task = await Task.create({ ...req.body, projectId: project.id });
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/api/tasks', auth, async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'Member') {
      whereClause.assigneeId = req.user.id;
    }
    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name'] }
      ]
    });
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.patch('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).send();
    
    // Members can only update status of their own tasks
    if (req.user.role === 'Member') {
      if (task.assigneeId !== req.user.id) return res.status(403).send();
      const updates = Object.keys(req.body);
      if (updates.some(u => u !== 'status')) return res.status(403).send({ error: 'Members can only update status' });
    }

    Object.assign(task, req.body);
    await task.save();
    
    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: User, as: 'assignee', attributes: ['id', 'name'] }
      ]
    });
    res.send(updatedTask);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.delete('/api/tasks/:id', auth, isAdmin, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).send();
    await task.destroy();
    res.send({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/api/dashboard/stats', auth, async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'Member') {
      whereClause.assigneeId = req.user.id;
    }
    
    const totalTasks = await Task.count({ where: whereClause });
    const completedTasks = await Task.count({ where: { ...whereClause, status: 'Done' } });
    const inProgressTasks = await Task.count({ where: { ...whereClause, status: 'In Progress' } });
    const toDoTasks = await Task.count({ where: { ...whereClause, status: 'To Do' } });
    
    res.send({ totalTasks, completedTasks, inProgressTasks, toDoTasks });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../frontend/dist')));
app.get(/^((?!\/api).)*$/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5001;
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
});
