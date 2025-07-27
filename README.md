# React-Frontend-Project-manager-
# Project Manager Frontend

This is the frontend for my first-year project: a project management system built with React and Axios. It connects to a Flask and MySQL backend, handling users, projects, lists, and tasks with full CRUD operations.

## Description

The app allows users to select a user, then view and manage their projects, lists, and tasks in a hierarchical manner. It supports creating new users, projects, lists, and tasks through simple forms. Tasks can be marked as completed or deleted, and can have optional descriptions and due dates.

It also performs a connection check to the backend server on startup, providing clear feedback if the server is unreachable or there are CORS issues.

## Technologies Used

- React (frontend UI)
- Axios (API requests)
- CSS (styling)
- Connects to a Flask backend running on `http://localhost:5001`

## How to Run

1. Ensure the Flask backend is running on port 5001.
2. Clone this repository.
3. Install dependencies and run the app:
 ```bash
   npm install
   npm start
