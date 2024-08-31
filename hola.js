// index.js
const express = require('express');
const db = require('./database');
const app = express();

app.use(express.json());

// Obtener todas las tareas
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ tasks: rows });
    });
});

// Obtener una tarea por ID
app.get('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ task: row });
    });
});

// Crear una nueva tarea
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;
    db.run('INSERT INTO tasks (title, description) VALUES (?, ?)', [title, description], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ task: { id: this.lastID, title, description, completed: 0 } });
    });
});

// Actualizar una tarea
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, description, completed } = req.body;
    db.run(
        'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?',
        [title, description, completed, id],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json({ message: 'Task updated successfully' });
        }
    );
});

// Eliminar una tarea
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
    });
});

// Iniciar el servidor
const PORT = 8001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
