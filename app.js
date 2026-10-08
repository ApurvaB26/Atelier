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

taskCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    checkbox.closest('tr').classList.toggle('done', checkbox.checked);
    updateTaskCount();
  });
});
searchInput.addEventListener('input', filterTasks);

const projectDialogBackdrop = document.querySelector('#project-dialog-backdrop');
const projectDialog = projectDialogBackdrop.querySelector('.project-dialog');
const projectForm = document.querySelector('#project-form');
const openProjectDialogButton = document.querySelector('[data-open-project-dialog]');
const projectNameInput = document.querySelector('#project-name');
const projectDescription = document.querySelector('#project-description');
const characterCount = document.querySelector('.character-count');
const attachmentInput = document.querySelector('#project-attachment');
const attachmentDropzone = document.querySelector('.attachment-dropzone');
const attachmentFilename = document.querySelector('.attachment-filename');
const teamPicker = document.querySelector('.team-picker');
const teamMemberInputs = Array.from(teamPicker.querySelectorAll('input[type="checkbox"]'));
const teamSelectionCount = document.querySelector('.team-selection-count');
const teamSelectionFraction = document.querySelector('.team-selection-fraction');
const colleagueSearchInput = document.querySelector('.colleague-search-input');
const teamMemberRows = Array.from(teamPicker.querySelectorAll('.team-options > label:not(.colleague-search)'));
const noColleaguesMessage = teamPicker.querySelector('.no-colleagues');
const customSelects = Array.from(projectDialog.querySelectorAll('.custom-select'));
const clearTeamSelectionButton = document.querySelector('.clear-team-selection');
const teamDoneButton = document.querySelector('.team-done-btn');
const dashboardView = document.querySelector('#dashboard-view');
const projectsView = document.querySelector('#projects-view');
const viewLinks = Array.from(document.querySelectorAll('[data-view-target]'));
const projectSearchInput = document.querySelector('#project-search');
const projectStatusFilter = document.querySelector('#project-status-filter');
const starredProjectsFilter = document.querySelector('.starred-filter');
const projectCards = Array.from(document.querySelectorAll('[data-project-card]'));
const emptyProjectsMessage = document.querySelector('.empty-projects');
const datePickers = Array.from(projectDialog.querySelectorAll('.date-picker'));
let dialogReturnFocus = null;

function setCurrentView(viewName) {
  const showProjects = viewName === 'projects';
  document.querySelector('.app').classList.toggle('project-page-active', showProjects);
  dashboardView.hidden = showProjects;
  projectsView.hidden = !showProjects;

  document.querySelectorAll('.nav-bar [data-view-target]').forEach((link) => {
    const isCurrent = link.dataset.viewTarget === viewName;
    link.classList.toggle('active', isCurrent);
    if (isCurrent) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function filterProjectCards() {
  const query = projectSearchInput.value.trim().toLocaleLowerCase();
  const selectedStatus = projectStatusFilter.value;
  const showStarredOnly = starredProjectsFilter.getAttribute('aria-pressed') === 'true';
  let visibleCount = 0;

  projectCards.forEach((card) => {
    const matchesSearch = card.textContent.toLocaleLowerCase().includes(query);
    const matchesStatus = selectedStatus === 'all' || card.dataset.status === selectedStatus;
    const matchesStarred = !showStarredOnly || card.dataset.starred === 'true';
    const isVisible = matchesSearch && matchesStatus && matchesStarred;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  emptyProjectsMessage.hidden = visibleCount !== 0;
}

viewLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    setCurrentView(link.dataset.viewTarget);
  });
});

projectSearchInput.addEventListener('input', filterProjectCards);
projectStatusFilter.addEventListener('change', filterProjectCards);
starredProjectsFilter.addEventListener('click', () => {
  const isPressed = starredProjectsFilter.getAttribute('aria-pressed') === 'true';
  starredProjectsFilter.setAttribute('aria-pressed', String(!isPressed));
  filterProjectCards();
});

projectCards.forEach((card) => {
  const starButton = card.querySelector('.project-star');
  starButton.addEventListener('click', () => {
    const isStarred = starButton.getAttribute('aria-pressed') === 'true';
    starButton.setAttribute('aria-pressed', String(!isStarred));
    starButton.textContent = isStarred ? '☆' : '★';
    starButton.setAttribute('aria-label', `${isStarred ? 'Add' : 'Remove'} Lodha Belmondo ${isStarred ? 'to' : 'from'} starred projects`);
    card.dataset.starred = String(!isStarred);
    filterProjectCards();
  });
});

function openProjectDialog() {
  dialogReturnFocus = document.activeElement;
  projectDialogBackdrop.hidden = false;
  document.body.classList.add('project-dialog-open');
  projectNameInput.focus();
}

function closeProjectDialog() {
  projectDialogBackdrop.hidden = true;
  document.body.classList.remove('project-dialog-open');
  teamPicker.open = false;
  datePickers.forEach((datePicker) => { datePicker.open = false; });
  colleagueSearchInput.value = '';
  filterTeamMembers();
  dialogReturnFocus?.focus();
}

function updateCharacterCount() {
  characterCount.textContent = `${projectDescription.value.length} / 500`;
}

function updateTeamSelection() {
  const selectedMembers = teamMemberInputs.filter((input) => input.checked);
  teamSelectionCount.textContent = `${selectedMembers.length} ${selectedMembers.length === 1 ? 'member' : 'members'} selected`;
  teamSelectionFraction.textContent = `${selectedMembers.length} / ${teamMemberInputs.length}`;
}

function filterTeamMembers() {
  const query = colleagueSearchInput.value.trim().toLocaleLowerCase();
  let visibleCount = 0;

  teamMemberRows.forEach((row) => {
    const matches = row.textContent.toLocaleLowerCase().includes(query);
    row.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  noColleaguesMessage.hidden = visibleCount !== 0;
}

function setAttachment(file) {
  if (!file) return;
  attachmentFilename.textContent = file.name;
  attachmentDropzone.setAttribute('aria-label', `Selected file: ${file.name}`);
}

function getDropdownValueInput(dropdown) {
  const inputId = dropdown.dataset.select === 'region' ? 'project-location' : `project-${dropdown.dataset.select}`;
  return document.getElementById(inputId);
}

function selectDropdownOption(dropdown, option) {
  const input = getDropdownValueInput(dropdown);
  const value = option.dataset.value;

  input.value = value;
  dropdown.querySelector('.select-value').textContent = value;
  dropdown.querySelectorAll('[data-value]').forEach((item) => {
    item.setAttribute('aria-selected', String(item === option));
  });
  dropdown.open = false;
}

function filterDropdownOptions(searchInput) {
  const dropdown = searchInput.closest('.custom-select');
  const options = Array.from(dropdown.querySelectorAll('.select-menu [data-value]'));
  const emptyState = dropdown.querySelector('.no-options');
  const query = searchInput.value.trim().toLocaleLowerCase();
  let matchCount = 0;

  options.forEach((option) => {
    const matches = option.textContent.toLocaleLowerCase().includes(query);
    option.hidden = !matches;
    if (matches) matchCount += 1;
  });

  emptyState.hidden = matchCount !== 0;
}

function parseDateInput(value) {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getIsoWeek(date) {
  const weekDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  weekDate.setDate(weekDate.getDate() + 3 - ((weekDate.getDay() + 6) % 7));
  const firstThursday = new Date(weekDate.getFullYear(), 0, 4);
  return 1 + Math.round(((weekDate - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
}

function renderCalendar(datePicker) {
  const dateInput = document.getElementById(datePicker.dataset.datePicker);
  const selectedDate = parseDateInput(dateInput.value);
  const today = new Date();
  const viewDate = datePicker.viewDate || selectedDate || today;
  const displayedDate = selectedDate || today;
  const monthLabel = datePicker.querySelector('.calendar-month-label');
  const selectedDateLabel = datePicker.querySelector('.calendar-selected-date');
  const weekLabel = datePicker.querySelector('.calendar-week');
  const daysContainer = datePicker.querySelector('.calendar-days');
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstWeekday = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  monthLabel.textContent = new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(viewDate);
  selectedDateLabel.textContent = selectedDate
    ? new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(selectedDate)
    : 'Select a date';
  weekLabel.textContent = `Week ${getIsoWeek(displayedDate)} · ${displayedDate.getFullYear()}`;

  const calendarDays = [];
  for (let index = 0; index < 42; index += 1) {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), index - firstWeekday + 1);
    const isOutsideMonth = date.getMonth() !== viewDate.getMonth();
    const isToday = formatDateInput(date) === formatDateInput(today);
    const isSelected = selectedDate && formatDateInput(date) === dateInput.value;
    const dayButton = document.createElement('button');
    dayButton.type = 'button';
    dayButton.className = 'calendar-day';
    if (isOutsideMonth) dayButton.classList.add('outside-month');
    if (isToday) dayButton.classList.add('is-today');
    if (isSelected) dayButton.classList.add('is-selected');
    dayButton.textContent = date.getDate();
    dayButton.setAttribute('aria-label', new Intl.DateTimeFormat('en', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    }).format(date));
    dayButton.setAttribute('aria-pressed', String(Boolean(isSelected)));
    dayButton.addEventListener('click', () => selectCalendarDate(datePicker, date));
    calendarDays.push(dayButton);
  }
  daysContainer.replaceChildren(...calendarDays);
}

function positionCalendar(datePicker) {
  const panel = datePicker.querySelector('.calendar-panel');
  const triggerRect = datePicker.querySelector('summary').getBoundingClientRect();
  const panelRect = panel.getBoundingClientRect();
  const edgePadding = 12;
  const left = Math.min(Math.max(edgePadding, triggerRect.left), window.innerWidth - panelRect.width - edgePadding);
  const roomBelow = window.innerHeight - triggerRect.bottom - edgePadding;
  const roomAbove = triggerRect.top - edgePadding;
  const top = roomBelow >= panelRect.height || roomBelow >= roomAbove
    ? Math.min(triggerRect.bottom + 8, window.innerHeight - panelRect.height - edgePadding)
    : Math.max(edgePadding, triggerRect.top - panelRect.height - 8);

  panel.style.setProperty('--calendar-panel-top', `${top}px`);
  panel.style.setProperty('--calendar-panel-left', `${left}px`);
}

function selectCalendarDate(datePicker, date) {
  const dateInput = document.getElementById(datePicker.dataset.datePicker);
  dateInput.value = formatDateInput(date);
  datePicker.querySelector('.date-picker-value').textContent = new Intl.DateTimeFormat('en', {
    month: 'short', day: 'numeric', year: 'numeric'
  }).format(date);
  datePicker.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
  renderCalendar(datePicker);
  datePicker.open = false;
  dateInput.dispatchEvent(new Event('change', { bubbles: true }));
}

datePickers.forEach((datePicker) => {
  const dateInput = document.getElementById(datePicker.dataset.datePicker);
  const placeholder = datePicker.dataset.datePicker === 'project-start-date' ? 'Select start date' : 'Select target date';

  datePicker.addEventListener('toggle', () => {
    if (datePicker.open) {
      datePickers.forEach((otherPicker) => {
        if (otherPicker !== datePicker) otherPicker.open = false;
      });
      const selectedDate = parseDateInput(dateInput.value);
      datePicker.viewDate = selectedDate || new Date();
      renderCalendar(datePicker);
      requestAnimationFrame(() => positionCalendar(datePicker));
    }
  });

  datePicker.querySelectorAll('.calendar-month-prev, .calendar-back').forEach((button) => {
    button.addEventListener('click', () => {
      datePicker.viewDate = new Date(datePicker.viewDate.getFullYear(), datePicker.viewDate.getMonth() - 1, 1);
      renderCalendar(datePicker);
    });
  });

  datePicker.querySelector('.calendar-month-next').addEventListener('click', () => {
    datePicker.viewDate = new Date(datePicker.viewDate.getFullYear(), datePicker.viewDate.getMonth() + 1, 1);
    renderCalendar(datePicker);
  });

  datePicker.querySelector('.calendar-open-native').addEventListener('click', () => {
    const targetDate = parseDateInput(dateInput.value) || new Date();
    datePicker.viewDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    renderCalendar(datePicker);
  });

  datePicker.querySelector('.calendar-clear').addEventListener('click', () => {
    dateInput.value = '';
    datePicker.querySelector('.date-picker-value').textContent = placeholder;
    datePicker.viewDate = new Date();
    renderCalendar(datePicker);
    datePicker.open = false;
    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
  });

  datePicker.querySelector('.calendar-today').addEventListener('click', () => {
    selectCalendarDate(datePicker, new Date());
  });
});

window.addEventListener('resize', () => {
  datePickers.filter((datePicker) => datePicker.open).forEach(positionCalendar);
});

projectDialog.addEventListener('scroll', () => {
  datePickers.filter((datePicker) => datePicker.open).forEach(positionCalendar);
}, true);

openProjectDialogButton.addEventListener('click', openProjectDialog);
projectDialogBackdrop.querySelectorAll('[data-close-project-dialog]').forEach((button) => {
  button.addEventListener('click', closeProjectDialog);
});

projectDialogBackdrop.addEventListener('click', (event) => {
  if (event.target === projectDialogBackdrop) closeProjectDialog();
});

document.addEventListener('keydown', (event) => {
  if (projectDialogBackdrop.hidden) return;

  if (event.key === 'Escape') {
    event.preventDefault();
    const openDetails = Array.from(projectDialog.querySelectorAll('details[open]'));
    if (openDetails.length) {
      openDetails[openDetails.length - 1].open = false;
      return;
    }
    closeProjectDialog();
    return;
  }

  if (event.key !== 'Tab') return;
  const focusableElements = Array.from(projectDialog.querySelectorAll(
    'button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex]:not([tabindex="-1"])'
  )).filter((element) => element.offsetParent !== null);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
});

projectDescription.addEventListener('input', updateCharacterCount);
teamMemberInputs.forEach((input) => input.addEventListener('change', updateTeamSelection));
colleagueSearchInput.addEventListener('input', filterTeamMembers);
attachmentInput.addEventListener('change', () => setAttachment(attachmentInput.files[0]));

customSelects.forEach((dropdown) => {
  dropdown.querySelectorAll('[data-value]').forEach((option) => {
    option.addEventListener('click', () => selectDropdownOption(dropdown, option));
  });

  const search = dropdown.querySelector('.dropdown-search input');
  if (search) search.addEventListener('input', () => filterDropdownOptions(search));
});

document.querySelectorAll('.category-option').forEach((option) => {
  option.addEventListener('mouseenter', () => {
    option.closest('.category-options').dataset.hoveredValue = option.dataset.value;
  });
  option.addEventListener('mouseleave', () => {
    delete option.closest('.category-options').dataset.hoveredValue;
  });
});

clearTeamSelectionButton.addEventListener('click', () => {
  teamMemberInputs.forEach((input) => { input.checked = false; });
  updateTeamSelection();
});

teamDoneButton.addEventListener('click', () => {
  teamPicker.open = false;
  teamPicker.querySelector('summary').focus();
});

['dragenter', 'dragover'].forEach((eventName) => {
  attachmentDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    attachmentDropzone.classList.add('is-dragging');
  });
});

['dragleave', 'drop'].forEach((eventName) => {
  attachmentDropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    attachmentDropzone.classList.remove('is-dragging');
  });
});

attachmentDropzone.addEventListener('drop', (event) => {
  const [file] = event.dataTransfer.files;
  setAttachment(file);
});

projectForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const missingDropdown = customSelects.find((dropdown) => {
    const value = getDropdownValueInput(dropdown).value;
    return (dropdown.dataset.select === 'category' || dropdown.dataset.select === 'region') && !value;
  });

  if (missingDropdown) {
    missingDropdown.open = true;
    missingDropdown.querySelector('summary').focus();
    return;
  }

  if (!projectForm.reportValidity()) return;

  closeProjectDialog();
  projectForm.reset();
  customSelects.forEach((dropdown) => {
    dropdown.open = false;
    getDropdownValueInput(dropdown).value = '';
    dropdown.querySelector('.select-value').textContent = dropdown.dataset.select === 'category'
      ? 'Select project category'
      : dropdown.dataset.select === 'region'
        ? 'Select region'
        : dropdown.dataset.select === 'manager'
          ? 'Select project manager'
          : 'Select Consultant';
    dropdown.querySelectorAll('[data-value]').forEach((option) => option.removeAttribute('aria-selected'));
    const search = dropdown.querySelector('.dropdown-search input');
    if (search) {
      search.value = '';
      filterDropdownOptions(search);
    }
  });
  datePickers.forEach((datePicker) => {
    datePicker.open = false;
    datePicker.querySelector('.date-picker-value').textContent = datePicker.dataset.datePicker === 'project-start-date'
      ? 'Select start date'
      : 'Select target date';
    datePicker.viewDate = new Date();
  });
  colleagueSearchInput.value = '';
  filterTeamMembers();
  attachmentFilename.textContent = '';
  attachmentDropzone.removeAttribute('aria-label');
  updateCharacterCount();
  updateTeamSelection();

  const confirmation = document.createElement('div');
  confirmation.className = 'project-toast';
  confirmation.setAttribute('role', 'status');
  confirmation.textContent = 'Project details submitted successfully.';
  document.body.append(confirmation);
  window.setTimeout(() => confirmation.remove(), 3500);
});

document.addEventListener('click', (event) => {
  projectDialog.querySelectorAll('details[open]').forEach((details) => {
    if (!details.contains(event.target)) details.open = false;
  });
});

const taskDialogBackdrop = document.querySelector('#task-dialog-backdrop');
const taskForm = document.querySelector('#task-form');
const taskAssigneeInput = document.querySelector('#task-assignee');

function openTaskDialog() {
  taskDialogBackdrop.hidden = false;
  document.body.classList.add('project-dialog-open');
  document.querySelector('#task-title').focus();
}

function closeTaskDialog() {
  taskDialogBackdrop.hidden = true;
  document.body.classList.remove('project-dialog-open');
  taskForm.reset();
}

document.querySelector('.add-btn').addEventListener('click', openTaskDialog);

taskDialogBackdrop.querySelectorAll('[data-close-task-dialog]').forEach((button) => {
  button.addEventListener('click', closeTaskDialog);
});

taskDialogBackdrop.addEventListener('click', (event) => {
  if (event.target === taskDialogBackdrop) closeTaskDialog();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !taskDialogBackdrop.hidden) closeTaskDialog();
});

document.querySelector('.assign-me').addEventListener('click', () => {
  taskAssigneeInput.value = 'Apurva Bhadange';
});

taskForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!taskForm.reportValidity()) return;

  closeTaskDialog();

  const toast = document.createElement('div');
  toast.className = 'project-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = 'Task created successfully.';
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 3500);
});

/* BREADCRUMB */
function renderBreadcrumb(trail) {
  const items = [{ label: "Atelier", view: "dashboard" }, ...trail];

  document.getElementById("breadcrumb").innerHTML = items
    .map((item, i) =>
      i === items.length - 1
        ? `<span class="current">${item.label}</span>`
        : `<a href="#${item.view}" data-view-target="${item.view}">${item.label}</a>`
    )
    .join("<span>›</span>");
}

function sidebarLabel(key) {
  const link = document.querySelector(`.nav-bar [data-view-target="${key}"]`);
  return link ? link.textContent.trim() : "Dashboard";
}

document.addEventListener("click", (e) => {
  // Sidebar links and breadcrumb links
  const viewLink = e.target.closest("[data-view-target]");
  if (viewLink) {
    renderBreadcrumb([{ label: sidebarLabel(viewLink.dataset.viewTarget) }]);
    return;
  }

  // Open a project: label comes from the card's title
  const openLink = e.target.closest(".workspace-link");
  if (openLink) {
    const name = openLink.closest("[data-project-card]").querySelector("h2").textContent;
    renderBreadcrumb([
      { label: "Projects", view: "projects" },
      { label: name }
    ]);
  }
});

renderBreadcrumb([{ label: sidebarLabel(location.hash.replace("#", "") || "dashboard") }]);

function addWorkspaceLink(card) {
  if (card.querySelector(".workspace-link")) return;
  card.insertAdjacentHTML("beforeend", `
    <a class="workspace-link" href="#project-workspace">
      Open Project Workspace <span aria-hidden="true">→</span>
    </a>
  `);
}

document.querySelectorAll("[data-project-card]").forEach(addWorkspaceLink);

/* OPEN PROJECT OVERVIEW PAGE */
const overviewPage = document.getElementById("overview-page");

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-project-card]");

  if (card && !e.target.closest(".project-star")) {
    const name = card.querySelector("h2").textContent;

    document.getElementById("dashboard-view").hidden = true;
    document.getElementById("projects-view").hidden = true;
    overviewPage.hidden = false;

    overviewPage.querySelector(".project-title").textContent = name;
    renderBreadcrumb([{ label: "Projects", view: "projects" }, { label: name }]);
    return;
  }

  if (e.target.closest("[data-view-target]")) overviewPage.hidden = true;
});

/* CREATE TASK MODAL */
const taskBackdrop = document.getElementById("task-dialog-backdrop");

document.addEventListener("click", (e) => {
  if (e.target.closest(".create-task-btn")) {
    taskBackdrop.hidden = false;
  }

  if (e.target.closest("[data-close-task-dialog]") || e.target === taskBackdrop) {
    taskBackdrop.hidden = true;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") taskBackdrop.hidden = true;
});