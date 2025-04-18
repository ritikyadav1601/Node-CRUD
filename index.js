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

// 1. GET /todos
app.get("/todos", (req, res) => {
  const todos = getExistingData();
  res.status(200).json(todos);
});

// 2. GET /todos/:id
app.get("/todos/:id", (req, res) => {
  const id = req.params.id;
  const todos = getExistingData();
  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).send();
  }

  res.status(200).json(todo);
});

// 3. POST /todos
app.post("/todos", (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).send("Invalid request");
  }

  const newTodo = {
    id: Date.now().toString(),
    title,
    description
  };

  const todos = getExistingData();
  todos.push(newTodo);
  saveData(todos);

  res.status(201).json({ id: newTodo.id });
});

// 4. PUT /todos/:id
app.put("/todos/:id", (req, res) => {
  const id = req.params.id;
  const todos = getExistingData();
  const todo = todos.find(todo => todo.id === id);

  if (!todo) {
    return res.status(404).send();
  }

  const { title, description } = req.body;
  if (title !== undefined) todo.title = title;
  if (description !== undefined) todo.description = description;

  saveData(todos);
  res.status(200).send();
});

// 5. DELETE /todos/:id
app.delete("/todos/:id", (req, res) => {
  const id = req.params.id;
  const todos = getExistingData();
  const index = todos.findIndex(todo => todo.id === id);

  if (index === -1) {
    return res.status(404).send();
  }

  todos.splice(index, 1);
  saveData(todos);

  res.status(200).send();
});

// Catch-all for undefined routes
app.use((req, res) => {
  res.status(404).send();
});

app.listen(3000, () => {
  console.log("Server is running");
});


