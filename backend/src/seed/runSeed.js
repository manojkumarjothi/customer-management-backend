/**
 * Seed script - Admin, sample employees, tasks, leaves.
 * Run: node src/seed/runSeed.js (from backend folder) or npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { User, EmployeeProfile, Task, Project, Leave } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management';

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  const admin = await User.findOne({ email: 'admin@company.com' });
  if (admin) {
    console.log('Seed already run (admin exists). Exiting.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'Admin@123',
    role: 'ADMIN',
    employeeId: 'EMP001',
    department: 'IT',
    designation: 'System Administrator',
    isActive: true,
  });

  const managerUser = await User.create({
    name: 'HR Manager',
    email: 'hr@company.com',
    password: 'Manager@123',
    role: 'MANAGER',
    employeeId: 'EMP002',
    department: 'HR',
    designation: 'HR Manager',
    isActive: true,
  });

  const emp1 = await User.create({
    name: 'John Doe',
    email: 'john@company.com',
    password: 'Employee@123',
    role: 'EMPLOYEE',
    employeeId: 'EMP003',
    department: 'Engineering',
    designation: 'Software Engineer',
    isActive: true,
  });

  const emp2 = await User.create({
    name: 'Jane Smith',
    email: 'jane@company.com',
    password: 'Employee@123',
    role: 'EMPLOYEE',
    employeeId: 'EMP004',
    department: 'Engineering',
    designation: 'Senior Developer',
    isActive: true,
  });

  await EmployeeProfile.create({ user: adminUser._id });
  await EmployeeProfile.create({ user: managerUser._id });
  await EmployeeProfile.create({ user: emp1._id });
  await EmployeeProfile.create({ user: emp2._id });

  const project = await Project.create({
    name: 'Employee Portal',
    department: 'Engineering',
    startDate: new Date(),
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  });

  await Task.create({
    title: 'Setup auth module',
    description: 'Implement JWT login and refresh',
    assignedTo: emp1._id,
    assignedBy: managerUser._id,
    priority: 'High',
    status: 'Done',
    project: project._id,
    progressPercent: 100,
  });

  await Task.create({
    title: 'Dashboard UI',
    description: 'Build dashboard with charts',
    assignedTo: emp2._id,
    assignedBy: managerUser._id,
    priority: 'Medium',
    status: 'InProgress',
    project: project._id,
    progressPercent: 40,
  });

  await Leave.create({
    employee: emp1._id,
    leaveType: 'Casual',
    fromDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    toDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    reason: 'Personal',
    status: 'Pending',
  });

  console.log('Seed completed: Admin, HR Manager, 2 employees, 1 project, 2 tasks, 1 leave.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
