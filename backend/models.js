const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DATABASE_URL ? ':memory:' : path.join(__dirname, 'database.sqlite'),
  logging: false
});

// User Model
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('Admin', 'Member'), defaultValue: 'Member' }
});

// Project Model
const Project = sequelize.define('Project', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT }
});

// Task Model
const Task = sequelize.define('Task', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('To Do', 'In Progress', 'Done'), defaultValue: 'To Do' },
  priority: { type: DataTypes.ENUM('Low', 'Medium', 'High'), defaultValue: 'Medium' },
  dueDate: { type: DataTypes.DATE },
  tags: { type: DataTypes.STRING }, // comma separated
  storyPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
  estimatedHours: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// Relationships
User.hasMany(Project, { foreignKey: 'ownerId' });
Project.belongsTo(User, { as: 'owner', foreignKey: 'ownerId' });

Project.hasMany(Task, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId' });

User.hasMany(Task, { foreignKey: 'assigneeId' });
Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });

module.exports = { sequelize, User, Project, Task };
