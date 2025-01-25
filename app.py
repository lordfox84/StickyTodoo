from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)

# Initialize database
def init_db():
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    description TEXT,
                    deadline TEXT,
                    priority TEXT,
                    color TEXT,
                    column TEXT NOT NULL
                )''')
    conn.commit()
    conn.close()

# Route for the main page
@app.route('/')
def index():
    return render_template('index.html')

# API to fetch tasks
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute("SELECT * FROM tasks")
    tasks = [dict(id=row[0], title=row[1], description=row[2], deadline=row[3], priority=row[4], color=row[5], column=row[6]) for row in c.fetchall()]
    conn.close()
    return jsonify(tasks)

# API to add a task
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    deadline = data.get('deadline')
    priority = data.get('priority')
    color = data.get('color', '#ffffff')
    column = data.get('column', 'todo')

    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute("INSERT INTO tasks (title, description, deadline, priority, color, column) VALUES (?, ?, ?, ?, ?, ?)",
              (title, description, deadline, priority, color, column))
    conn.commit()
    task_id = c.lastrowid
    conn.close()

    return jsonify({"id": task_id, "title": title, "description": description, "deadline": deadline, "priority": priority, "color": color, "column": column})

# API to update a task column
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    column = data.get('column')

    conn = sqlite3.connect('tasks.db')
    c = conn.cursor()
    c.execute("UPDATE tasks SET column = ? WHERE id = ?", (column, task_id))
    conn.commit()
    conn.close()

    return jsonify({"id": task_id, "column": column})

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
