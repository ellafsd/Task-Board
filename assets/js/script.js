// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  const card = $(`
    <div class="card mb-2" data-id="${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">${task.dueDate}</small></p>
        <button class="btn btn-danger btn-sm delete-task">Delete</button>
      </div>
    </div>
  `);

  // Color coding based on due date
  const today = dayjs().format('YYYY-MM-DD');
  if (dayjs(task.dueDate).isBefore(today)) {
    card.find('.card-body').addClass('bg-danger text-white');
  } else if (dayjs(task.dueDate).isSame(today)) {
    card.find('.card-body').addClass('bg-warning text-dark');
  }
  return card;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards, #in-progress-cards, #done-cards").empty();
  taskList.forEach(task => {
    const card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });

  // Make cards draggable
  $(".card").draggable({
    revert: "invalid",
    stack: ".card",
    helper: "clone"
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const task = {
    id: generateTaskId(),
    title: $("#task-title").val(),
    description: $("#task-desc").val(),
    dueDate: $("#task-due-date").val(),
    status: "todo"
  };

  taskList.push(task);
  saveTasks();
  renderTaskList();
  $("#formModal").modal("hide");
  $("#task-form")[0].reset();
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest(".card").data("id");
  taskList = taskList.filter(task => task.id !== taskId);
  saveTasks();
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = ui.helper.data("id");
    const newStatus = $(this).attr("id"); // Getting the new status directly from the ID
    taskList = taskList.map(task => {
      if (task.id === taskId) {
        task.status = newStatus; // Update the status to match the new lane
      }
      return task;
    });
    saveTasks();
    renderTaskList();
  }
  
  // Make lanes droppable
  $(".lane").droppable({
      accept: ".card",
      drop: handleDrop
    });


// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  $("#task-form").on("submit", handleAddTask);

  $(document).on("click", ".delete-task", handleDeleteTask);

  $(".lane").droppable({
    accept: ".card",
    drop: handleDrop
  });

  $("#task-due-date").datepicker({
    dateFormat: "yy-mm-dd"
  });
});
