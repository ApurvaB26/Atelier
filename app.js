const searchInput = document.querySelector('.search input');
const taskRows = Array.from(document.querySelectorAll('.data-table tbody tr'));
const taskCheckboxes = Array.from(document.querySelectorAll('.data-table tbody input[type="checkbox"]'));
const taskCount = document.querySelector('.panel-count');

function updateTaskCount() {
  const completed = taskCheckboxes.filter((checkbox) => checkbox.checked).length;
  taskCount.textContent = `${completed}/${taskCheckboxes.length}`;
}

function filterTasks() {
  const query = searchInput.value.trim().toLocaleLowerCase();

  taskRows.forEach((row) => {
    row.hidden = !row.textContent.toLocaleLowerCase().includes(query);
  });
}

taskCheckboxes.forEach((checkbox) => checkbox.addEventListener('change', updateTaskCount));
searchInput.addEventListener('input', filterTasks);
