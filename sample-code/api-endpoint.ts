// Simple Express-like API endpoint that needs refactoring
import { readFileSync, writeFileSync, existsSync } from 'fs';

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

// Global state (bad practice)
let users: User[] = [];
let nextId = 1;

// Load users from file
function loadUsers() {
  if (existsSync('users.json')) {
    const data = readFileSync('users.json', 'utf-8');
    users = JSON.parse(data);
    nextId = Math.max(...users.map(u => u.id), 0) + 1;
  }
}

// Save users to file
function saveUsers() {
  writeFileSync('users.json', JSON.stringify(users));
}

// API handlers (no validation, no error handling)
export function createUser(name: string, email: string) {
  const user = {
    id: nextId++,
    name: name,
    email: email,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  saveUsers();
  return user;
}

export function getUser(id: number) {
  return users.find(u => u.id === id);
}

export function updateUser(id: number, name: string, email: string) {
  const user = users.find(u => u.id === id);
  if (user) {
    user.name = name;
    user.email = email;
    saveUsers();
  }
  return user;
}

export function deleteUser(id: number) {
  const index = users.findIndex(u => u.id === id);
  if (index >= 0) {
    users.splice(index, 1);
    saveUsers();
  }
}

export function listUsers() {
  return users;
}

// Issues to fix:
// 1. No input validation
// 2. No error handling
// 3. Global mutable state
// 4. Synchronous file operations
// 5. No TypeScript strict mode usage
// 6. No email format validation
// 7. No duplicate email check
