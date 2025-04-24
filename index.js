const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use(bodyParser.json());

function getExistingData() {
  try {
    let data = fs.readFileSync("todos.json", "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveData(data) {
  fs.writeFileSync("todos.json", JSON.stringify(data, null, 2), "utf-8");
}

// 1. GET /todos - get all todos
app.get("/todos", (req, res) => {
  const todos = getExistingData();
  res.status(200).json(todos);
});

// 2. GET /todos/:id - get a specific todo by ID
app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  const todos = getExistingData();
  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).send("Todo not found");
  }

  res.status(200).json(todo);
});

// 3. POST /todos - create a new todo
app.post("/todos", (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).send("Title and description are required");
  }

  const todos = getExistingData();

  let id = Date.now().toString();
  while (todos.some(todo => todo.id === id)) {
    id = Date.now().toString();
  }

  const newTodo = {
    id,
    title,
    description,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  todos.push(newTodo);
  saveData(todos);

  res.status(201).json({ id: newTodo.id });
});

// 4. PUT /todos/:id - update a todo by ID
app.put("/todos/:id", (req, res) => {
  const id = req.params.id;
  const todos = getExistingData();
  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).send("Todo not found");
  }

  const { title, description, status } = req.body;

  if (title !== undefined) todo.title = title;
  if (description !== undefined) todo.description = description;
  if (status !== undefined) todo.status = status;

  todo.updatedAt = new Date().toISOString();

  saveData(todos);
  res.status(200).send("Todo updated");
});

// 5. DELETE /todos/:id - delete a todo by ID
app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  const todos = getExistingData();
  const index = todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return res.status(404).send("Todo not found");
  }

  todos.splice(index, 1);
  saveData(todos);

  res.status(200).send("Todo deleted");
});

// 6. GET /todos/status/:status - filter todos by status
app.get("/todos/status/:status", (req, res) => {
  const status = req.params.status;
  const todos = getExistingData();
  const filtered = todos.filter(todo => todo.status === status);

  res.status(200).json(filtered);
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).send("Route not found");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
