const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());


const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run(`CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    completed INTEGER DEFAULT 0
  )`);
});


app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', [], (err, rows) => {
    if (err) res.status(500).json({error: err.message});
    else res.json(rows);
  });
});


app.post('/tasks', (req, res) => {
  const { title, description } = req.body;
  db.run('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description], function(err) {
    if (err) res.status(500).json({error: err.message});
    else res.json({ id: this.lastID, title, description, completed: 0 });
  });
});


app.put('/tasks/:id', (req, res) => {
  const { title, description } = req.body;
  db.run('UPDATE tasks SET title = ?, description = ? WHERE id = ?', [title, description, req.params.id], function(err) {
    if (err) res.status(500).json({error: err.message});
    else res.json({ message: 'Task updated' });
  });
});


app.delete('/tasks/:id', (req, res) => {
  db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], function(err) {
    if (err) res.status(500).json({error: err.message});
    else res.json({ message: 'Task deleted' });
  });
});

app.put('/tasks/:id/toggle', (req, res) => {
  db.get('SELECT completed FROM tasks WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    const newStatus = row.completed ? 0 : 1;
    db.run('UPDATE tasks SET completed = ? WHERE id = ?', [newStatus, req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Task status updated', completed: newStatus });
    });
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


