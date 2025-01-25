    const addTaskButton = document.querySelector('.add-task-button');
    const modal = document.getElementById('taskModal');
    const saveTaskButton = document.getElementById('saveTaskButton');

    let currentlyEditingTask = null;

    // Zobrazení modálního okna
    addTaskButton.addEventListener('click', () => {
        currentlyEditingTask = null;
        clearModalInputs();
        modal.style.display = 'flex';
    });

    // Uložení nebo úprava úkolu
    saveTaskButton.addEventListener('click', () => {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const priority = document.getElementById('taskPriority').value;
        const color = document.getElementById('taskColor').value;

        if (currentlyEditingTask) {
            // Úprava existujícího úkolu
            updateTaskElement(currentlyEditingTask, title, description, priority, color);
        } else {
            // Vytvoření nového úkolu
            const task = createTaskElement(title, description, priority, color);
            document.getElementById('todo').appendChild(task);
        }

        modal.style.display = 'none';
    });

    // Vytvoření nového úkolu
    function createTaskElement(title, description, priority, color) {
        const task = document.createElement('div');
        task.className = 'task';
        task.style.backgroundColor = color;
        task.style.color = getTextColor(color); // Dynamicky nastavíme barvu textu
        task.draggable = true;
        task.id = `task-${Date.now()}`;

        updateTaskContent(task, title, description, priority);

        task.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', task.id);
        });

        task.addEventListener('click', () => openTaskForEditing(task));

        return task;
    }

    // Aktualizace obsahu úkolu
    function updateTaskContent(task, title, description, priority) {
        let priorityTag;
        if (priority === 'High') priorityTag = 'h1';
        else if (priority === 'Medium') priorityTag = 'h2';
        else priorityTag = 'h3';

        task.innerHTML = `
            <${priorityTag}>${title}</${priorityTag}>
            <p>${description}</p>
        `;
    }

    // Aktualizace existujícího úkolu
    function updateTaskElement(task, title, description, priority, color) {
        task.style.backgroundColor = color;
        task.style.color = getTextColor(color); // Dynamicky nastavíme barvu textu
        updateTaskContent(task, title, description, priority);
    }

    // Funkce pro otevření úkolu k úpravě
    function openTaskForEditing(task) {
        const parentColumnId = task.parentElement.id;

        if (parentColumnId === 'done') {
            alert('Tento úkol už nelze upravovat.');
            return;
        }

        currentlyEditingTask = task;

        document.getElementById('taskTitle').value = task.querySelector('h1,h2,h3').textContent;
        document.getElementById('taskDescription').value = task.querySelector('p').textContent;
        document.getElementById('taskPriority').value = task.querySelector('em').textContent;
        document.getElementById('taskColor').value = rgbToHex(task.style.backgroundColor);

        modal.style.display = 'flex';
    }

    // Vyčištění vstupů modálního okna
    function clearModalInputs() {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskPriority').value = 'Low';
        document.getElementById('taskColor').value = '#ffffff';
    }

    // Převod RGB na HEX
    function rgbToHex(rgb) {
        const result = rgb.match(/\d+/g).map(x => parseInt(x).toString(16).padStart(2, '0'));
        return `#${result.join('')}`;
    }

    // Funkce pro výpočet kontrastu na základě světlosti barvy
    function getTextColor(backgroundColor) {
        // Převedeme HEX na RGB
        const r = parseInt(backgroundColor.slice(1, 3), 16);
        const g = parseInt(backgroundColor.slice(3, 5), 16);
        const b = parseInt(backgroundColor.slice(5, 7), 16);

        // Vypočítáme relativní světlost
        const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

        // Pokud je světlost vyšší než 0.5, použijeme tmavý text, jinak světlý
        return luminance > 0.5 ? '#000000' : '#ffffff';
    }

    // Inicializace sloupců pro přetahování
    document.querySelectorAll('.column').forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
        });

        column.addEventListener('drop', e => {
            e.preventDefault();
            const taskId = e.dataTransfer.getData('text/plain');
            const taskElement = document.getElementById(taskId);
            if (taskElement) {
                column.appendChild(taskElement);
                handleTaskDrop(taskElement, column.id);
            }
        });
    });

    // Funkce při přesunutí úkolu do "Done"
    function handleTaskDrop(task, columnId) {
        if (columnId === 'done') {
            const now = new Date();
            const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
            const completionInfo = document.createElement('p');
            completionInfo.style.fontSize = '0.8em';
            completionInfo.style.color = 'gray';
            completionInfo.textContent = `Added to Done: ${formattedDate}`;
            task.appendChild(completionInfo);
        }
    }
