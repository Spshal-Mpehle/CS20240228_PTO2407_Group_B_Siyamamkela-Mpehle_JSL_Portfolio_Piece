// TASK: import helper functions from utils
// TASK: import initialData
import { initialData } from './data/utils.js'; // Adjust the path based on your project structure


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById('header-board-name'),
  columnDivs: document.querySelectorAll('.column-div'),
  editTaskModal: document.getElementById('edit-task-modal'),
  filterDiv: document.getElementById('filter-div'),
  hideSideBarBtn: document.getElementById('hide-sidebar-btn'),
  showSideBarBtn: document.getElementById('show-sidebar-btn'),
  themeSwitch: document.getElementById('theme-switch'),
  createNewTaskBtn: document.getElementById('create-new-task-btn'),
  modalWindow: document.getElementById('modal-window'),
};

// Tracks the currently active board. Defaults to the first board in initialData if available.
let activeBoard = initialData.length > 0 ? initialData[0].board : "";


// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard ;  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener('click', () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; // Assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add('tasks-container'); // Add a class name for styling and identification
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
        taskElement.addEventListener('click', () => { 
          openEditTaskModal(task);
        });
  
        tasksContainer.appendChild(taskElement);
      });
    });
  
  function openEditTaskModal(task) {
    // Set task details in modal inputs
    const taskTitleInput = document.getElementById('edit-task-title');
    const taskStatusInput = document.getElementById('edit-task-status');
    taskTitleInput.value = task.title;
    taskStatusInput.value = task.status;
  
    // Get button elements from the task modal
    const saveChangesBtn = document.getElementById('save-task-changes-btn');
    const deleteTaskBtn = document.getElementById('delete-task-btn');
  
    // Call saveTaskChanges upon click of Save Changes button
    saveChangesBtn.onclick = () => {
      saveTaskChanges(task.id);
      toggleModal(false, elements.editTaskModal);
    };
  
    // Delete task using a helper function and close the task modal
    deleteTaskBtn.onclick = () => {
      deleteTask(task.id);
      toggleModal(false, elements.editTaskModal);
      refreshTasksUI();
    };
  
    toggleModal(true, elements.editTaskModal); // Show the edit task modal
  }
}


function refreshTasksUI() {
  if (activeBoard) {
    filterAndDisplayTasksByBoard(activeBoard);
  } else {
    console.warn('No active board selected. Cannot refresh tasks UI.');
  }
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.edit-board-btn').forEach(btn => { 
    
    if (btn.textContent === boardName) {
      btn.classList.add('active'); 
    } else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  if (!task || !task.status || !task.title || !task.id) {
    console.error('Invalid task object. Ensure task has status, title, and id properties.');
    return;
  }

  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener('click', () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener('click', () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener('click', () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  if (modal) {
    modal.style.display = show ? 'block' : 'none';
  } else {
    console.error('Modal element is not defined.');
  }
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  // Assign user input to the task object
  const taskTitleInput = document.getElementById('new-task-title');
  const taskStatusInput = document.getElementById('new-task-status');
  
  const task = {
    id: Date.now().toString(), // Generate a unique ID for the task
    title: taskTitleInput.value.trim(),
    status: taskStatusInput.value.trim(),
    board: activeBoard // Assign the task to the currently active board
  };

  if (!task.title || !task.status) {
    console.error('Task title and status are required.');
    return;
  }

  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}


function toggleSidebar(show) {
  const sidebar = document.getElementById('side-bar');
  if (!sidebar) {
    console.error('Sidebar element not found. Ensure the element with ID "side-bar" exists in the DOM.');
    return;
  }
  sidebar.style.display = show ? 'block' : 'none';
  localStorage.setItem('showSideBar', show.toString());
}

function toggleTheme() {
  const isLightTheme = document.body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}



openTaskEditModal();

function openEditTaskModal(task) {
  // Set task details in modal inputs
  const taskTitleInput = document.getElementById('edit-task-title');
  const taskStatusInput = document.getElementById('edit-task-status');
  taskTitleInput.value = task.title;
  taskStatusInput.value = task.status;

  // Get button elements from the task modal
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');

  // Call saveTaskChanges upon click of Save Changes button
  saveChangesBtn.onclick = () => {
    saveTaskChanges(task.id);
    toggleModal(false, elements.editTaskModal);
  };

  // Delete task using a helper function and close the task modal
  deleteTaskBtn.onclick = () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  };

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const taskTitleInput = document.getElementById('edit-task-title');
  const taskStatusInput = document.getElementById('edit-task-status');
  const updatedTitle = taskTitleInput.value.trim();
  const updatedStatus = taskStatusInput.value.trim();

  if (!updatedTitle || !updatedStatus) {
    console.error('Task title and status are required.');
    return;
  }

  // Create an object with the updated task details
  const updatedTask = {
    id: taskId,
    title: updatedTitle,
    status: updatedStatus,
    board: activeBoard // Ensure the task remains associated with the active board
  };

  // Update task using a helper function
  updateTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}