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
const libraryView = document.querySelector('#library-view');
const viewLinks = Array.from(document.querySelectorAll('[data-view-target]'));
const projectSearchInput = document.querySelector('#project-search');
const projectStatusFilter = document.querySelector('#project-status-filter');
const starredProjectsFilter = document.querySelector('.starred-filter');
const projectCards = Array.from(document.querySelectorAll('[data-project-card]'));
const emptyProjectsMessage = document.querySelector('.empty-projects');
const datePickers = Array.from(projectDialog.querySelectorAll('.date-picker'));
let dialogReturnFocus = null;

function setCurrentView(viewName) {
  openItemsPage.hidden = true;
  const showProjects = viewName === 'projects';
  const showLibrary = viewName === 'library';
  document.querySelector('.app').classList.toggle('project-page-active', showProjects);
  document.querySelector('.app').classList.toggle('library-page-active', showLibrary);
  dashboardView.hidden = showProjects || showLibrary;
  projectsView.hidden = !showProjects;
  libraryView.hidden = !showLibrary;

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

const policySearchInput = document.querySelector('#policy-search');
const policyList = document.querySelector('#policy-list');
const policyCategoryButtons = Array.from(document.querySelectorAll('[data-policy-category]'));
const policyEmptyMessage = document.querySelector('#policy-empty');
const policyFilterButton = document.querySelector('.policy-filter-button');
const policyFilterMenu = document.querySelector('#policy-filter-menu');
const policySortSelect = document.querySelector('#policy-sort');
let selectedPolicyCategory = 'all';

function filterPolicies() {
  const query = policySearchInput.value.trim().toLocaleLowerCase();
  let visibleCount = 0;

  policyList.querySelectorAll('tr').forEach((row) => {
    const matchesCategory = selectedPolicyCategory === 'all' || row.dataset.policyCategory === selectedPolicyCategory;
    const matchesSearch = row.textContent.toLocaleLowerCase().includes(query);
    row.hidden = !matchesCategory || !matchesSearch;
    if (!row.hidden) visibleCount += 1;
  });

  policyEmptyMessage.hidden = visibleCount !== 0;
}

policyCategoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedPolicyCategory = button.dataset.policyCategory;
    policyCategoryButtons.forEach((categoryButton) => {
      const isSelected = categoryButton === button;
      categoryButton.classList.toggle('active', isSelected);
      categoryButton.setAttribute('aria-pressed', String(isSelected));
    });
    filterPolicies();
  });
});

policySearchInput.addEventListener('input', filterPolicies);
policyFilterButton.addEventListener('click', () => {
  const isExpanded = policyFilterButton.getAttribute('aria-expanded') === 'true';
  policyFilterButton.setAttribute('aria-expanded', String(!isExpanded));
  policyFilterMenu.hidden = isExpanded;
});
policySortSelect.addEventListener('change', () => {
  const rows = Array.from(policyList.querySelectorAll('tr'));
  rows.sort((first, second) => policySortSelect.value === 'name'
    ? first.cells[1].querySelector('strong').textContent.localeCompare(second.cells[1].querySelector('strong').textContent)
    : second.dataset.updated.localeCompare(first.dataset.updated));
  policyList.replaceChildren(...rows);
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

function createProjectCard(data) {
  const name = data.get('projectName');
  const code = data.get('projectCode');
  const category = data.get('category');
  const meta = [code, category].filter(Boolean).join(' • ');

  const card = document.createElement('article');
  card.className = 'project-card';
  card.dataset.projectCard = '';
  card.dataset.status = 'on-track';
  card.dataset.starred = 'false';

  card.innerHTML = `
    <div class="project-card-top">
      <span class="project-building-icon" aria-hidden="true">▥</span>
      <span class="project-state on-track"><i></i> On Track</span>
      <button class="project-star" type="button" aria-pressed="false">☆</button>
    </div>
    <h2></h2>
    <p class="project-meta"></p>
    <div class="project-progress-label"><span>Project Progress</span><strong>0%</strong></div>
    <div class="project-progress"><span style="width:0%"></span></div>
    <div class="project-metrics"><span>◉ <strong>0</strong> Tasks</span><span>◉ <strong>0</strong> RFIs</span><span>◉ <strong>0</strong> Deliverables</span></div>
    <div class="project-milestone milestone-inactive"><span class="milestone-icon" aria-hidden="true">▣</span><strong>No active milestone</strong></div>
    <div class="project-stakeholders"><span><small>Project Stakeholders</small><small>Just now</small></span></div>
  `;

  card.querySelector('h2').textContent = name;
  card.querySelector('.project-meta').textContent = meta;
  card.querySelector('.project-star').setAttribute('aria-label', `Add ${name} to starred projects`);

  addWorkspaceLink(card);
  document.getElementById('project-grid').prepend(card);
}

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

  createProjectCard(new FormData(projectForm));

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

  if (!projectTasksView.hidden) {
    addProjectTask({
      title: document.getElementById('task-title').value.trim(),
      description: document.getElementById('task-description').value.trim(),
      priority: document.getElementById('task-priority').value,
      discipline: document.getElementById('task-discipline').value,
      targetDate: document.getElementById('task-date').value,
      assignee: taskAssigneeInput.value.trim()
    });
  }

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
    const viewName = viewLink.dataset.viewTarget;
    const trail = viewName === 'library'
      ? [{ label: 'Library', view: 'library' }, { label: 'Policies' }]
      : [{ label: sidebarLabel(viewName) }];
    renderBreadcrumb(trail);
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
const projectHeader = overviewPage.querySelector(".project-header");
const projectHeaderCard = overviewPage.querySelector(".project-header-card");
const projectOverviewContent = document.getElementById("project-overview-content");
const projectTasksView = document.getElementById("project-tasks-view");
const projectRfisView = document.getElementById("project-rfis-view");
const projectTaskList = document.getElementById("project-task-list");
const projectTaskSearch = document.getElementById("project-task-search");
const projectTaskStatusFilter = document.getElementById("project-task-status-filter");
let projectTaskPriorityFilter = "all";

function setProjectView(viewName) {
  const showOverview = viewName === "overview";
  projectHeader.hidden = !showOverview;
  projectHeaderCard.hidden = !showOverview;
  projectOverviewContent.hidden = !showOverview;
  projectTasksView.hidden = viewName !== "tasks";
  projectRfisView.hidden = viewName !== "rfis";

  document.querySelectorAll("[data-project-view]").forEach((tab) => {
    const isActive = tab.dataset.projectView === viewName;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  const name = overviewPage.querySelector(".project-title").textContent;
  const tabLabel = { tasks: "Tasks", rfis: "RFIs" }[viewName];
  renderBreadcrumb(tabLabel
    ? [{ label: "Projects", view: "projects" }, { label: name, view: "projects" }, { label: tabLabel }]
    : [{ label: "Projects", view: "projects" }, { label: name }]);
}

function taskMatchesProjectFilters(row) {
  const query = projectTaskSearch.value.trim().toLocaleLowerCase();
  const priorityMatches = projectTaskPriorityFilter === "all" || row.dataset.priority === projectTaskPriorityFilter;
  const statusMatches = projectTaskStatusFilter.value === "all" || row.dataset.group === projectTaskStatusFilter.value;
  return priorityMatches && statusMatches && row.textContent.toLocaleLowerCase().includes(query);
}

function filterProjectTasks() {
  const matchingGroups = new Set();

  projectTaskList.querySelectorAll("[data-task-row]").forEach((row) => {
    const matches = taskMatchesProjectFilters(row);
    const groupHeader = projectTaskList.querySelector(`[data-group-header="${row.dataset.group}"]`);
    const groupExpanded = groupHeader.querySelector(".task-group-toggle").getAttribute("aria-expanded") === "true";
    row.hidden = !matches || !groupExpanded;
    if (matches) matchingGroups.add(row.dataset.group);
  });

  projectTaskList.querySelectorAll("[data-group-header]").forEach((header) => {
    const group = header.dataset.groupHeader;
    const matchingCount = Array.from(projectTaskList.querySelectorAll(`[data-task-row][data-group="${group}"]`))
      .filter(taskMatchesProjectFilters).length;
    header.hidden = matchingCount === 0;
    header.querySelector("[data-task-group-count]").textContent = String(matchingCount).padStart(2, "0");
  });
}

function updateProjectTaskCounts() {
  projectTaskList.querySelectorAll("[data-group-header]").forEach((header) => {
    const group = header.dataset.groupHeader;
    const count = projectTaskList.querySelectorAll(`[data-task-row][data-group="${group}"]`).length;
    header.querySelector("[data-task-group-count]").textContent = String(count).padStart(2, "0");
  });
}

function getProjectTaskGroup(status) {
  if (status === "Completed") return "completed";
  if (status === "In Review") return "in-review";
  if (status === "In Progress" || status === "On Hold") return "in-progress";
  return "todo";
}

function addProjectTask(data) {
  const nextId = Math.max(17, ...Array.from(projectTaskList.querySelectorAll("[data-task-row]"), (row) => {
    const id = Number(row.cells[1].textContent.replace(/\D/g, ""));
    return Number.isFinite(id) ? id : 0;
  })) + 1;
  const priority = data.priority.toLocaleLowerCase();
  const row = document.createElement("tr");
  row.className = "project-task-row";
  row.dataset.taskRow = "";
  row.dataset.group = "todo";
  row.dataset.taskStatus = "Not Started";
  row.dataset.priority = priority;
  row.dataset.targetDate = data.targetDate;
  row.dataset.description = data.description;
  row.innerHTML = `
    <td><label class="custom-checkbox"><input class="task-checkbox" type="checkbox"><span class="checkbox-box"></span></label></td>
    <td></td><td><strong></strong><span class="row-subtitle"></span></td>
    <td><span class="badge"></span></td><td><span class="status due-date"></span></td>
    <td>Wing 25</td><td></td><td><button class="comment-btn project-task-action" type="button" data-open-task-details>Comment</button></td>
  `;
  row.cells[1].textContent = `T-${nextId}`;
  row.querySelector("td:nth-child(3) strong").textContent = data.title;
  row.querySelector(".row-subtitle").textContent = data.discipline;
  row.querySelector(".badge").classList.add(priority);
  row.querySelector(".badge").textContent = data.priority;
  row.cells[6].textContent = data.assignee;
  row.querySelector(".task-checkbox").setAttribute("aria-label", `Complete ${data.title}`);
  if (data.targetDate) updateTaskDueLabel(row, data.targetDate);
  projectTaskList.querySelector('[data-group-header="todo"]').after(row);
  updateProjectTaskCounts();
  filterProjectTasks();
}

document.querySelectorAll("[data-project-view]").forEach((tab) => {
  tab.addEventListener("click", () => setProjectView(tab.dataset.projectView));
});

document.querySelectorAll("[data-priority-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    projectTaskPriorityFilter = button.dataset.priorityFilter;
    document.querySelectorAll("[data-priority-filter]").forEach((filterButton) => {
      const isSelected = filterButton === button;
      filterButton.classList.toggle("is-active", isSelected);
      filterButton.setAttribute("aria-pressed", String(isSelected));
    });
    filterProjectTasks();
  });
});

projectTaskSearch.addEventListener("input", filterProjectTasks);
projectTaskStatusFilter.addEventListener("change", filterProjectTasks);

document.querySelector(".task-advanced-filter-button").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const isExpanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!isExpanded));
  document.getElementById("task-advanced-filters").hidden = isExpanded;
});

projectTaskList.addEventListener("click", (event) => {
  const toggle = event.target.closest("[data-toggle-task-group]");
  if (!toggle) return;
  const isExpanded = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!isExpanded));
  filterProjectTasks();
});

projectTaskList.querySelectorAll(".task-checkbox").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const row = checkbox.closest("[data-task-row]");
    if (!row) return;
    row.dataset.taskStatus = checkbox.checked ? "Completed" : "In Progress";
    const oldGroup = row.dataset.group;
    row.dataset.group = getProjectTaskGroup(row.dataset.taskStatus);
    row.classList.toggle("done", checkbox.checked);
    const groupHeader = projectTaskList.querySelector(`[data-group-header="${row.dataset.group}"]`);
    groupHeader.after(row);
    updateProjectTaskCounts();
    filterProjectTasks();
    if (oldGroup !== row.dataset.group) addTaskActivity(row, `Status changed to ${row.dataset.taskStatus}`);
  });
});

projectTaskList.addEventListener("click", (event) => {
  const action = event.target.closest("[data-open-task-details]");
  if (!action) return;
  const row = action.closest("[data-task-row]");
  if (row) {
    row.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.getElementById("drawer-comment-input").focus();
  }
});

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-project-card]");

  if (card && !e.target.closest(".project-star")) {
    const name = card.querySelector("h2").textContent;

    document.getElementById("dashboard-view").hidden = true;
    document.getElementById("projects-view").hidden = true;
    overviewPage.hidden = false;

    overviewPage.querySelector(".project-title").textContent = name;
    setProjectView("overview");
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


//TOWER FILTER BUTTON
const towerBtn = document.querySelector(".tower-filter");
const towerMenu = document.querySelector(".tower-menu");
const starredBtn = document.querySelector(".starred-towers-btn");

towerBtn.addEventListener("click", () => {
  towerMenu.hidden = !towerMenu.hidden;
});

towerMenu.addEventListener("click", (e) => {
  const star = e.target.closest(".tower-star");
  if (star) {
    const on = star.getAttribute("aria-pressed") === "true";
    star.setAttribute("aria-pressed", String(!on));
    applyStarredFilter();
    return;
  }

  const name = e.target.closest(".tower-name");
  if (name) {
    document.querySelector(".tower-filter-label").textContent = name.textContent;
    towerMenu.hidden = true;
  }
});

starredBtn.addEventListener("click", () => {
  const on = starredBtn.getAttribute("aria-pressed") === "true";
  starredBtn.setAttribute("aria-pressed", String(!on));
  applyStarredFilter();
});

function applyStarredFilter() {
  const onlyStarred = starredBtn.getAttribute("aria-pressed") === "true";
  towerMenu.querySelectorAll(".tower-row").forEach((row) => {
    const star = row.querySelector(".tower-star");
    row.hidden = onlyStarred && star && star.getAttribute("aria-pressed") !== "true";
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".tower-dropdown")) towerMenu.hidden = true;
});

/* COLLAPSE SIDEBAR */
document.querySelector(".collapse-btn").addEventListener("click", () => {
  document.querySelector(".app").classList.toggle("sidebar-collapsed");
});

/* RIGHT RAIL CALENDAR */
const calendarBtn = document.querySelector(".rail-calendar-btn");
const railCalendar = document.getElementById("rail-calendar");
let viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let selectedDate = null;

function renderRailCalendar() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayString = new Date().toDateString();

  railCalendar.querySelector(".calendar-month-label").textContent =
    viewDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  const start = new Date(year, month, 1 - viewDate.getDay());
  let html = "";

  for (let i = 0; i < 42; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);

    let classes = "calendar-day";
    if (day.getMonth() !== month) classes += " outside-month";
    if (day.toDateString() === todayString) classes += " is-today";
    if (selectedDate && day.toDateString() === selectedDate) classes += " is-selected";

    html += `<button class="${classes}" type="button" data-date="${day.toDateString()}">${day.getDate()}</button>`;
  }

  railCalendar.querySelector(".calendar-days").innerHTML = html;
}

calendarBtn.addEventListener("click", () => {
  railCalendar.hidden = !railCalendar.hidden;
});

railCalendar.querySelector(".calendar-month-prev").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
  renderRailCalendar();
});

railCalendar.querySelector(".calendar-month-next").addEventListener("click", () => {
  viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  renderRailCalendar();
});

railCalendar.querySelector(".calendar-days").addEventListener("click", (e) => {
  const dayBtn = e.target.closest(".calendar-day");
  if (!dayBtn) return;
  selectedDate = dayBtn.dataset.date;
  renderRailCalendar();
});

renderRailCalendar();

/* CLOSE CALENDAR ON OUTSIDE CLICK */
document.addEventListener("click", (e) => {
  const path = e.composedPath();
  const clickedInside = path.includes(railCalendar) || path.includes(calendarBtn);

  if (!clickedInside) railCalendar.hidden = true;
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") railCalendar.hidden = true;
});

/* MEETINGS SECTION */
const inMinutes = (min) => new Date(Date.now() + min * 60000);

const meetings = [
  { start: inMinutes(12),  end: inMinutes(102), title: "Elanor Coordination Meeting", type: "online",    place: "Teams link",            project: "Lodha Belmondo", attendees: 5, status: "join" },
  { start: inMinutes(150), end: inMinutes(210), title: "MEP Design Review",           type: "in-person", place: "Belle, 36th Floor, OLP", project: "Lodha One",      attendees: 8, status: "join" },
  { start: inMinutes(300), end: inMinutes(360), title: "Fire Strategy Call",          type: "online",    place: "Teams link",            project: "Palava",         attendees: 12, status: "going" }
];

const formatTime = (d) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function getChip(m) {
  const mins = Math.round((m.start - Date.now()) / 60000);
  if (mins <= 0) return { text: "Live now", cls: "live" };
  if (mins < 60) return { text: `In ${mins} min`, cls: "soon" };
  return { text: `In ${Math.floor(mins / 60)} h`, cls: "" };
}

function createMeetingCard(m) {
  
  const chip = getChip(m);
  const attendees = m.attendees
    ? `<span class="meeting-attendees">
         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 10 9" fill="none">
  <path d="M7.08366 8V7.16667C7.08366 6.72464 6.90806 6.30072 6.5955 5.98816C6.28294 5.67559 5.85902 5.5 5.41699 5.5H2.08366C1.64163 5.5 1.21771 5.67559 0.905148 5.98816C0.592587 6.30072 0.416992 6.72464 0.416992 7.16667V8M9.58366 8V7.16667C9.58338 6.79739 9.46047 6.43865 9.23423 6.1468C9.00798 5.85494 8.69121 5.64649 8.33366 5.55417M6.66699 0.554167C7.0255 0.645959 7.34326 0.854459 7.57017 1.1468C7.79709 1.43913 7.92026 1.79868 7.92026 2.16875C7.92026 2.53882 7.79709 2.89837 7.57017 3.1907C7.34326 3.48304 7.0255 3.69154 6.66699 3.78333M5.41699 2.16667C5.41699 3.08714 4.6708 3.83333 3.75033 3.83333C2.82985 3.83333 2.08366 3.08714 2.08366 2.16667C2.08366 1.24619 2.82985 0.5 3.75033 0.5C4.6708 0.5 5.41699 1.24619 5.41699 2.16667Z" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" stroke-opacity="0.7"/>
</svg>
         ${m.attendees}
       </span>`
    : "";

  return `
    <article class="meeting-card" tabindex="0" data-date="${new Date(m.start - m.start.getTimezoneOffset() * 60000).toISOString().slice(0, 10)}">
      <div class="meeting-status-row">
        <span class="meeting-status ${chip.cls}"><i></i>${chip.text}</span>
        ${attendees}
      </div>

      <div class="meeting-body">
        <div class="meeting-time">
          <strong>${formatTime(m.start)}</strong>
          <span>${formatTime(m.end)}</span>
        </div>

        <div class="meeting-info">
          <strong class="meeting-title">${m.title}</strong>
          <span class="meeting-place">${m.place}</span>
          <div class="meeting-tools">
            <button class="meeting-tool" type="button" data-action="notes">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              Notes
            </button>
            <button class="meeting-tool" type="button">MOM Tracker</button>
          </div>
        </div>

        <div class="meeting-side">
          <button class="meeting-btn" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
            Join
          </button>
        </div>
      </div>
    </article>
  `;
}

function renderSchedule() {
  const upcoming = meetings
    .filter((m) => m.end > Date.now())
    .sort((a, b) => a.start - b.start);

  document.getElementById("schedule-list").innerHTML = upcoming.length
    ? upcoming.map(createMeetingCard).join("")
    : `<p class="schedule-empty">No upcoming meetings</p>`;
}

renderSchedule();
setInterval(renderSchedule, 60000);

const notesDialogBackdrop = document.getElementById("notes-dialog-backdrop");
const notesSubjectInput = document.getElementById("notes-subject");
const notesDateInput = document.getElementById("notes-date");
let notesDialogReturnFocus = null;

function openNotesDialog(meetingCard) {
  notesDialogReturnFocus = document.activeElement;
  notesSubjectInput.value = meetingCard.querySelector(".meeting-title").textContent;
  notesDateInput.value = meetingCard.dataset.date;
  notesDialogBackdrop.hidden = false;
  document.body.classList.add("project-dialog-open");
  notesSubjectInput.focus();
}

function closeNotesDialog() {
  notesDialogBackdrop.hidden = true;
  document.body.classList.remove("project-dialog-open");
  notesDialogReturnFocus?.focus();
}

document.addEventListener("click", (event) => {
  const notesButton = event.target.closest('[data-action="notes"]');
  if (notesButton) {
    openNotesDialog(notesButton.closest(".meeting-card"));
    return;
  }

  if (event.target.closest("[data-close-notes-dialog]") || event.target === notesDialogBackdrop) {
    closeNotesDialog();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !notesDialogBackdrop.hidden) closeNotesDialog();
});

/* COLLAPSED RIGHT RAIL ITEMS */
document.querySelectorAll(".rail-collapse-btn, .rail-expand-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".app").classList.toggle("rail-collapsed");
  });
});
const svgOpen = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">`;

const railIcons = {
  calendar: `${svgOpen}<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  check:    `${svgOpen}<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
  video:    `${svgOpen}<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`,
  cube:     `${svgOpen}<path d="M21 8a2 2 0 0 0-1-1.7l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7Z"/></svg>`
};

const healthData = { completed: 38, progress: 24, delayed: 4 };

let overlayWeekOffset = 0;

const railOverlays = {
  calendar() {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() + overlayWeekOffset * 7);

  const days = [...Array(7)].map((_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    const isToday = d.toDateString() === today.toDateString();
    return `<span class="${isToday ? "is-today" : ""}">${String(d.getDate()).padStart(2, "0")}</span>`;
  }).join("");

  const chevron = (points) =>
    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="${points}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

  return `
    <div class="overlay-top overlay-top-calendar">
      <strong class="overlay-month">${sunday.toLocaleString("en-US", { month: "long", year: "numeric" })}</strong>
      <div class="overlay-arrows">
        <button class="overlay-week-prev" type="button" aria-label="Previous week">${chevron("M10 12L6 8L10 4")}</button>
        <button class="overlay-week-next" type="button" aria-label="Next week">${chevron("M6 12L10 8L6 4")}</button>
      </div>
    </div>
    <div class="overlay-week overlay-weekdays"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
    <div class="overlay-week">${days}</div>
  `;
},

  meeting() {
    const next = meetings
      .filter((m) => m.end > Date.now())
      .sort((a, b) => a.start - b.start)[0];

    return `
      <div class="overlay-top"><strong>Next meeting</strong><a href="#" class="rail-view-all">View All ↗</a></div>
      ${next ? createMeetingCard(next) : '<p class="schedule-empty">No upcoming meetings</p>'}
    `;
  },

  health() {
    const total = healthData.completed + healthData.progress + healthData.delayed;
    const row = (cls, label, n) =>
      `<div class="overlay-row"><span class="overlay-dot ${cls}"></span>${label}<strong>${n}</strong></div>`;

    return `
      <div class="overlay-top">
        <div><strong>Project health</strong><small>${total} Total Items</small></div>
        <a href="#" class="rail-view-all">Details ↗</a>
      </div>
      ${row("success", "Completed", healthData.completed)}
      ${row("progress", "In progress", healthData.progress)}
      ${row("delayed", "Delayed", healthData.delayed)}
    `;
  }
};

const railMiniItems = [
  { icon: "calendar", label: "Calendar",        sub: "Wed, 02 · Sep", divider: true, overlay: "calendar" },
  { icon: "check",    label: "Needs you first", pill: "4 pending",    divider: true, red: true },
  { icon: "video",    label: "Meetings",        count: "02", sub: "10:30", overlay: "meeting" },
  { icon: "cube",     label: "Project health",  pill: "4 delayed",    divider: true, overlay: "health" }
];

function createRailMiniItem(item) {
  return `
    ${item.divider ? '<hr class="rail-mini-divider">' : ""}
    <div class="rail-mini-item">
      <span class="rail-mini-icon${item.red ? " red" : ""}">${railIcons[item.icon]}</span>
      <span class="rail-mini-label">${item.label}${item.count ? ` <small class="rail-mini-count">${item.count}</small>` : ""}</span>
      ${item.sub ? `<span class="rail-mini-sub">${item.sub}</span>` : ""}
      ${item.pill ? `<span class="rail-mini-pill">${item.pill}</span>` : ""}
      ${item.overlay ? `<div class="rail-overlay">${railOverlays[item.overlay]()}</div>` : ""}
    </div>
  `;
}

document.getElementById("rail-mini-list").innerHTML =
  railMiniItems.map(createRailMiniItem).join("");

  document.addEventListener("click", (e) => {
  const btn = e.target.closest(".overlay-week-prev, .overlay-week-next");
  if (!btn) return;

  overlayWeekOffset += btn.classList.contains("overlay-week-next") ? 1 : -1;
  btn.closest(".rail-overlay").innerHTML = railOverlays.calendar();
});

/* TASK DETAILS DRAWER */
const drawerBackdrop = document.getElementById("task-drawer-backdrop");
const drawerStatus = document.querySelector('[data-drawer-select="status"]');
const drawerPriority = document.querySelector('[data-drawer-select="priority"]');
const drawerDueDate = document.getElementById("drawer-due-date");
const drawerDiscipline = document.getElementById("drawer-discipline");
const drawerCommentsList = document.getElementById("drawer-comments-list");
const drawerCommentForm = document.getElementById("drawer-comment-form");
const drawerDependencyList = document.getElementById("drawer-dependency-list");
const drawerDependencyForm = document.getElementById("drawer-dependency-form");
const drawerAttachmentList = document.getElementById("drawer-attachment-list");
const drawerAttachmentInput = document.getElementById("drawer-attachment-input");
const drawerActivityList = document.getElementById("drawer-activity-list");
let activeTaskRow = null;

function closeDrawer() {
  drawerBackdrop.hidden = true;
}

function renderDrawerComments() {
  const comments = JSON.parse(activeTaskRow.dataset.comments || "[]");
  if (!comments.length) {
    drawerCommentsList.innerHTML = '<p class="drawer-empty">No comments yet.</p>';
    return;
  }

  drawerCommentsList.replaceChildren(...comments.map((comment) => {
    const item = document.createElement("p");
    item.className = "drawer-comment";
    item.textContent = comment;
    return item;
  }));
}

function setDrawerSelect(dropdown, value) {
  const options = Array.from(dropdown.querySelectorAll(".drawer-select-option"));
  const selectedOption = options.find((option) => option.dataset.value === value) || options[0];
  dropdown.dataset.value = selectedOption.dataset.value;
  dropdown.querySelector(".drawer-selected-value").textContent = selectedOption.dataset.value;
  dropdown.querySelector(".drawer-selected-dot").className = `drawer-selected-dot ${selectedOption.dataset.color}`;
  options.forEach((option) => option.setAttribute("aria-selected", String(option === selectedOption)));
}

function getDrawerItems(row, key, legacyKey) {
  const storedItems = row.dataset[key];
  if (storedItems) {
    try {
      const parsedItems = JSON.parse(storedItems);
      if (Array.isArray(parsedItems)) return parsedItems;
      if (parsedItems) return [parsedItems];
    } catch {
      return [storedItems];
    }
  }
  return row.dataset[legacyKey] ? [row.dataset[legacyKey]] : [];
}

function addTaskActivity(row, message) {
  const activity = getDrawerItems(row, "activity", "");
  activity.push(message);
  row.dataset.activity = JSON.stringify(activity);
  renderDrawerActivity(row);
}

function renderDrawerActivity(row) {
  const activity = getDrawerItems(row, "activity", "");
  if (!activity.length) activity.push("Task created");
  row.dataset.activity = JSON.stringify(activity);
  drawerActivityList.replaceChildren(...activity.map((message) => {
    const item = document.createElement("p");
    item.className = "drawer-activity-item";
    item.textContent = message;
    return item;
  }));
}

function renderDrawerDependencies(row) {
  const dependencies = getDrawerItems(row, "dependencies", "dependency");
  if (!dependencies.length) {
    drawerDependencyList.innerHTML = '<p class="drawer-empty">No dependencies recorded.</p>';
    return;
  }

  drawerDependencyList.replaceChildren(...dependencies.map((dependency) => {
    const item = document.createElement("div");
    item.className = "drawer-item-chip";
    const text = document.createElement("span");
    text.textContent = dependency;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove dependency ${dependency}`);
    remove.dataset.removeDependency = dependency;
    remove.textContent = "×";
    item.append(text, remove);
    return item;
  }));
}

function renderDrawerAttachments(row) {
  const attachments = getDrawerItems(row, "attachments", "");
  if (!attachments.length) {
    drawerAttachmentList.innerHTML = '<p class="drawer-empty">No attachments.</p>';
    return;
  }

  drawerAttachmentList.replaceChildren(...attachments.map((attachment, index) => {
    const item = document.createElement("div");
    item.className = "drawer-item-chip";
    const text = document.createElement("span");
    text.textContent = attachment;
    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Remove attachment ${attachment}`);
    remove.dataset.removeAttachment = String(index);
    remove.textContent = "×";
    item.append(text, remove);
    return item;
  }));
}

drawerStatus.addEventListener("click", (event) => {
  const option = event.target.closest(".drawer-select-option");
  if (!option) return;
  setDrawerSelect(drawerStatus, option.dataset.value);
  drawerStatus.open = false;
});

drawerPriority.addEventListener("click", (event) => {
  const option = event.target.closest(".drawer-select-option");
  if (!option) return;
  setDrawerSelect(drawerPriority, option.dataset.value);
  drawerPriority.open = false;
});

document.querySelectorAll(".drawer-custom-select").forEach((dropdown) => {
  dropdown.addEventListener("toggle", () => {
    if (dropdown.open) {
      document.querySelectorAll(".drawer-custom-select").forEach((otherDropdown) => {
        if (otherDropdown !== dropdown) otherDropdown.open = false;
      });
    }
  });
});

function updateTaskDueLabel(row, dateValue) {
  const status = row.querySelector("td:nth-child(5) .status");
  if (!dateValue) {
    status.textContent = "Not set";
    status.className = "status due-date";
    return;
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const dueDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const difference = Math.round((dueDate - today) / 86400000);
  const dateParts = new Intl.DateTimeFormat("en", {
    weekday: "short", month: "short", day: "numeric"
  }).formatToParts(dueDate);
  const farDateLabel = `${dateParts.find((part) => part.type === "weekday").value}. ${dateParts.find((part) => part.type === "month").value} ${dateParts.find((part) => part.type === "day").value}`;
  status.textContent = difference < 0
    ? "Overdue"
    : difference === 0
      ? "Due Today"
      : difference === 1
        ? "Due Tomorrow"
        : farDateLabel;
  status.className = `status ${difference < 0 ? "overdue" : difference === 0 ? "due-today" : difference === 1 ? "due-tomorrow" : "due-date"}`;
}

document.addEventListener("click", (e) => {
  const row = e.target.closest(".table-scroll tbody tr, .project-task-table:not(.oi-table) tbody tr");
  const commentBtn = e.target.closest(".comment-btn");

  // Row click opens the drawer. The Comment button opens it too.
  if (row && (commentBtn || !e.target.closest(".custom-checkbox, button"))) { 
    const cells = row.querySelectorAll("td");
    const id = cells[1].textContent.trim();
    const title = row.querySelector("strong").textContent;
    const project = cells[5].textContent.trim();
    const assignedBy = cells[6].textContent.trim();
    const checkbox = row.querySelector('.task-checkbox');
    activeTaskRow = row;

    document.getElementById("drawer-meta").textContent = `${id} · ${project} · Assigned by ${assignedBy}`;
    document.getElementById("drawer-title").textContent = title;
    document.getElementById("drawer-description").textContent = row.dataset.description || "No description provided.";
    setDrawerSelect(drawerStatus, row.dataset.taskStatus || (checkbox.checked ? "Completed" : "In Progress"));
    setDrawerSelect(drawerPriority, row.dataset.priority || cells[3].textContent.trim() || "Medium");
    drawerDueDate.value = row.dataset.targetDate || "";
    drawerDiscipline.value = row.dataset.discipline || cells[2].querySelector(".row-subtitle")?.textContent.trim() || "General";
    renderDrawerDependencies(row);
    renderDrawerAttachments(row);
    renderDrawerActivity(row);
    drawerDependencyForm.hidden = true;
    drawerDependencyForm.reset();
    renderDrawerComments();
        drawerBackdrop.hidden = false;

    if (commentBtn) {
      const commentInput = document.getElementById("drawer-comment-input");
      commentInput.scrollIntoView({ block: "center" });
      commentInput.focus();
    }
    return;
  }

  if (e.target.closest("[data-close-drawer]") || e.target === drawerBackdrop) closeDrawer();
});

drawerCommentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("drawer-comment-input");
  const comment = input.value.trim();
  if (!comment || !activeTaskRow) return;

  const comments = JSON.parse(activeTaskRow.dataset.comments || "[]");
  comments.push(comment);
  activeTaskRow.dataset.comments = JSON.stringify(comments);
  addTaskActivity(activeTaskRow, `Comment added: ${comment}`);
  input.value = "";
  renderDrawerComments();
});

document.querySelector("[data-add-dependency]").addEventListener("click", () => {
  drawerDependencyForm.hidden = false;
  document.getElementById("drawer-dependency-input").focus();
});

document.querySelector("[data-cancel-dependency]").addEventListener("click", () => {
  drawerDependencyForm.reset();
  drawerDependencyForm.hidden = true;
});

drawerDependencyForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("drawer-dependency-input");
  const dependency = input.value.trim();
  if (!dependency || !activeTaskRow) return;

  const dependencies = getDrawerItems(activeTaskRow, "dependencies", "dependency");
  dependencies.push(dependency);
  activeTaskRow.dataset.dependencies = JSON.stringify(dependencies);
  delete activeTaskRow.dataset.dependency;
  renderDrawerDependencies(activeTaskRow);
  addTaskActivity(activeTaskRow, `Dependency added: ${dependency}`);
  drawerDependencyForm.reset();
  drawerDependencyForm.hidden = true;
});

document.querySelector("[data-add-attachment]").addEventListener("click", () => drawerAttachmentInput.click());

drawerAttachmentInput.addEventListener("change", () => {
  if (!activeTaskRow) return;
  const attachments = getDrawerItems(activeTaskRow, "attachments", "");
  const addedAttachments = Array.from(drawerAttachmentInput.files, (file) => file.name);
  activeTaskRow.dataset.attachments = JSON.stringify([...attachments, ...addedAttachments]);
  renderDrawerAttachments(activeTaskRow);
  addedAttachments.forEach((name) => addTaskActivity(activeTaskRow, `Attachment added: ${name}`));
  drawerAttachmentInput.value = "";
});

document.addEventListener("click", (event) => {
  const dependencyButton = event.target.closest("[data-remove-dependency]");
  if (dependencyButton && activeTaskRow) {
    const dependency = dependencyButton.dataset.removeDependency;
    const dependencies = getDrawerItems(activeTaskRow, "dependencies", "dependency").filter((item) => item !== dependency);
    activeTaskRow.dataset.dependencies = JSON.stringify(dependencies);
    delete activeTaskRow.dataset.dependency;
    renderDrawerDependencies(activeTaskRow);
    addTaskActivity(activeTaskRow, `Dependency removed: ${dependency}`);
  }

  const attachmentButton = event.target.closest("[data-remove-attachment]");
  if (attachmentButton && activeTaskRow) {
    const index = Number(attachmentButton.dataset.removeAttachment);
    const attachments = getDrawerItems(activeTaskRow, "attachments", "");
    const [removedAttachment] = attachments.splice(index, 1);
    activeTaskRow.dataset.attachments = JSON.stringify(attachments);
    renderDrawerAttachments(activeTaskRow);
    if (removedAttachment) addTaskActivity(activeTaskRow, `Attachment removed: ${removedAttachment}`);
  }
});

document.querySelector(".drawer-save").addEventListener("click", () => {
  if (!activeTaskRow) return;

  const checkbox = activeTaskRow.querySelector(".task-checkbox");
  const priorityBadge = activeTaskRow.querySelector("td:nth-child(4) .badge");
  const discipline = activeTaskRow.querySelector("td:nth-child(3) .row-subtitle");
  const previousStatus = activeTaskRow.dataset.taskStatus || (checkbox.checked ? "Completed" : "In Progress");
  const previousPriority = activeTaskRow.dataset.priority || priorityBadge.textContent.trim();
  const previousDate = activeTaskRow.dataset.targetDate || "";
  const previousDiscipline = activeTaskRow.dataset.discipline || discipline?.textContent.trim() || "General";
  const changes = [];

  if (previousStatus !== drawerStatus.dataset.value) changes.push(`Status changed to ${drawerStatus.dataset.value}`);
  if (previousPriority !== drawerPriority.dataset.value) changes.push(`Priority changed to ${drawerPriority.dataset.value}`);
  if (previousDate !== drawerDueDate.value) changes.push(drawerDueDate.value ? `Target date set to ${drawerDueDate.value}` : "Target date cleared");
  if (previousDiscipline !== drawerDiscipline.value) changes.push(`Discipline changed to ${drawerDiscipline.value}`);

  activeTaskRow.dataset.taskStatus = drawerStatus.dataset.value;
  activeTaskRow.dataset.priority = drawerPriority.dataset.value;
  activeTaskRow.dataset.targetDate = drawerDueDate.value;
  activeTaskRow.dataset.discipline = drawerDiscipline.value;
  checkbox.checked = drawerStatus.dataset.value === "Completed";
  activeTaskRow.classList.toggle("done", checkbox.checked);
  priorityBadge.className = `badge ${drawerPriority.dataset.value.toLocaleLowerCase()}`;
  priorityBadge.textContent = drawerPriority.dataset.value;
  if (discipline) discipline.textContent = drawerDiscipline.value;
  updateTaskDueLabel(activeTaskRow, drawerDueDate.value);
  if (changes.length) addTaskActivity(activeTaskRow, changes.join(" · "));
  if (activeTaskRow.matches("[data-task-row]")) {
    activeTaskRow.dataset.group = getProjectTaskGroup(drawerStatus.dataset.value);
    projectTaskList.querySelector(`[data-group-header="${activeTaskRow.dataset.group}"]`).after(activeTaskRow);
    updateProjectTaskCounts();
    filterProjectTasks();
  } else {
    updateTaskCount();
  }
  closeDrawer();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !drawerBackdrop.hidden) closeDrawer();
});

/* PROFILE MENU */
const profileTrigger = document.querySelector(".profile-trigger");
const profileCard = document.getElementById("profile-card");
const roleSwitchTrigger = document.querySelector(".role-switch-trigger");
const roleSwitchMenu = document.querySelector("#role-switch-menu");
const currentRole = document.querySelector(".current-role");
const roleOptions = Array.from(roleSwitchMenu.querySelectorAll("[data-role]"));
const themeOptions = Array.from(document.querySelectorAll("[data-theme-choice]"));

function setProfileOpen(open) {
  profileCard.hidden = !open;
  profileTrigger.setAttribute("aria-expanded", String(open));
}

function setRoleMenuOpen(open, focusSelected = false) {
  roleSwitchMenu.hidden = !open;
  roleSwitchTrigger.setAttribute("aria-expanded", String(open));
  if (open && focusSelected) {
    (roleOptions.find((option) => option.getAttribute("aria-checked") === "true") || roleOptions[0]).focus();
  }
}

function setTheme(choice) {
  const effectiveTheme = choice === "system"
    ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
    : choice;
  document.documentElement.dataset.theme = effectiveTheme;
  localStorage.setItem("atelier-theme-choice", choice);
  themeOptions.forEach((option) => {
    const isSelected = option.dataset.themeChoice === choice;
    option.classList.toggle("active", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));
  });
}

profileTrigger.addEventListener("click", () => setProfileOpen(profileCard.hidden));

roleSwitchTrigger.addEventListener("click", () => {
  setProfileOpen(false);
  setRoleMenuOpen(roleSwitchMenu.hidden, roleSwitchMenu.hidden);
});

roleSwitchMenu.addEventListener("click", (event) => {
  const option = event.target.closest("[data-role]");
  if (!option) return;
  currentRole.textContent = option.dataset.role;
  roleOptions.forEach((roleOption) => {
    roleOption.setAttribute("aria-checked", String(roleOption === option));
  });
  setRoleMenuOpen(false);
});

roleSwitchMenu.addEventListener("keydown", (event) => {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  const currentIndex = roleOptions.indexOf(document.activeElement);
  const offset = event.key === "ArrowDown" ? 1 : -1;
  roleOptions[(currentIndex + offset + roleOptions.length) % roleOptions.length].focus();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".user-menu")) {
    setProfileOpen(false);
    setRoleMenuOpen(false);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    setProfileOpen(false);
    if (!roleSwitchMenu.hidden) {
      setRoleMenuOpen(false);
      roleSwitchTrigger.focus();
    }
  }
});

themeOptions.forEach((option) => {
  option.addEventListener("click", () => setTheme(option.dataset.themeChoice));
});

setTheme(localStorage.getItem("atelier-theme-choice") || "system");

/* DELIVERABLES */
const deliverableChecks = Array.from(document.querySelectorAll("#deliverables-table input[type='checkbox']"));
const deliverablesCount = document.querySelector("#dashboard-deliverables-panel .panel-count");

function updateDeliverablesCount() {
  const done = deliverableChecks.filter((c) => c.checked).length;
  deliverablesCount.textContent = `${done}/${deliverableChecks.length}`;
}

deliverableChecks.forEach((c) => {
  c.addEventListener("change", () => {
    c.closest("tr").classList.toggle("done", c.checked);
    updateDeliverablesCount();
  });
});

updateDeliverablesCount();

/* OPEN ITEMS PAGE */
const openItemsPage = document.getElementById("open-items-page");

function setOpenItemsTab(tab) {
  document.querySelectorAll("[data-open-tab]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.openTab === tab);
  });
  document.querySelectorAll("[data-open-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.openPanel !== tab;
  });

  const label = { deliverables: "Deliverables", rfis: "RFIs", tasks: "Tasks" }[tab];
  renderBreadcrumb([
    { label: "Dashboard", view: "dashboard" },
    { label: "Open Items" },
    { label }
  ]);
}

function showOpenItems(tab) {
  document.querySelector(".app").classList.add("project-page-active");
  dashboardView.hidden = true;
  projectsView.hidden = true;
  overviewPage.hidden = true;
  openItemsPage.hidden = false;
  setOpenItemsTab(tab);
}

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-open-items]");
  if (card) return showOpenItems(card.dataset.openItems);

  const tab = e.target.closest("[data-open-tab]");
  if (tab) setOpenItemsTab(tab.dataset.openTab);

  // breadcrumb links switch the page too
  const crumb = e.target.closest("#breadcrumb [data-view-target]");
  if (crumb) setCurrentView(crumb.dataset.viewTarget);
});

/* OPEN ITEMS PANELS */
const oiBadge = (p) => `<span class="badge ${p.toLowerCase()}">${p}</span>`;
const oiDue = (label, due) => {
  const cls = { overdue: "overdue", today: "due-today", tomorrow: "due-tomorrow" }[due] || "due-date";
  return `<span class="status ${cls}">${label}</span>`;
};
const oiTitle = (title, sub, extra = "") =>
  `<strong>${title}</strong>${extra}<span class="row-subtitle">${sub}</span>`;
const oiAction = (label) => {
  const icon = {
    Comment: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    Remind: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    Respond: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    View: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>'
  }[label];
  return `<button class="comment-btn" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>${label}</button>`;
};
const waiting = (who) => ` · <span class="waiting-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> Waiting on ${who}</span>`;

const openItemsConfig = {
  tasks: {
    title: "Your Tasks",
    checkbox: true,
    addLabel: "Add Task",
    groups: [
      { key: "todo", label: "To do", tone: "" },
      { key: "in-progress", label: "In Progress", tone: "is-blue" },
      { key: "in-review", label: "In Review", tone: "is-red" },
      { key: "completed", label: "Completed", tone: "is-green" }
    ],
    columns: [
      { label: "ID", cell: (r) => r.id },
      { label: "Task", cell: (r) => oiTitle(r.title, r.sub + (r.waiting ? waiting(r.waiting) : "")) },
      { label: "Priority", cell: (r) => oiBadge(r.priority) },
      { label: "Due Date", cell: (r) => (r.group === "completed" ? "—" : oiDue(r.dueLabel, r.due)) },
      { label: "Wing No.", cell: (r) => r.wing },
      { label: "Assigned By", cell: (r) => r.by },
      { label: "Action", cell: (r) => oiAction(r.action) }
    ],
    rows: [
      { id: "T-12", title: "Approve Revised Typical Floor", sub: "Plumbing", priority: "High", due: "today", dueLabel: "Due Today", wing: "Wing 25", by: "Apurva Bhadange", group: "todo", action: "Comment" },
      { id: "T-12", title: "Approve Revised Typical Floor", sub: "Plumbing", priority: "Medium", due: "today", dueLabel: "Due Today", wing: "Wing 25", by: "Apurva Bhadange", group: "todo", action: "Comment" },
      { id: "T-12", title: "Approve Revised Typical Floor", sub: "Plumbing", priority: "Medium", due: "overdue", dueLabel: "Overdue", wing: "Wing 25", by: "Sachin Patil", group: "in-progress", action: "Comment" },
      { id: "T-12", title: "Approve Revised Typical Floor", sub: "Plumbing", priority: "Low", due: "today", dueLabel: "Due Today", wing: "Wing 25", by: "Sachin Patil", group: "in-progress", action: "Comment" },
      { id: "T-12", title: "Approve Revised Typical Floor", sub: "Plumbing", priority: "Low", due: "tomorrow", dueLabel: "Due Tomorrow", wing: "Wing 25", by: "Sachin Patil", group: "in-progress", action: "Comment" },
      { id: "T-12", title: "Approve Revised Typical Floor", sub: "Firefighting", waiting: "MEP Consultant", priority: "Medium", due: "overdue", dueLabel: "Overdue", wing: "Wing 25", by: "Sachin Patil", group: "in-review", action: "Remind" },
      { id: "T-12", title: "Approve Revised Typical Floor", sub: "Firefighting", waiting: "MEP Consultant", priority: "Medium", due: "overdue", dueLabel: "Overdue", wing: "Wing 25", by: "Sachin Patil", group: "in-review", action: "Remind" },
      { id: "T-17", title: "Approve Revised Typical Floor", sub: "General", priority: "High", due: "", wing: "Wing 21", by: "Sachin Patil", group: "completed", action: "Comment" },
      { id: "T-17", title: "Approve Revised Typical Floor", sub: "General", priority: "Low", due: "", wing: "Wing 21", by: "Sachin Patil", group: "completed", action: "Comment" }
    ]
  },

  rfis: {
    title: "RFIs",
    checkbox: false,
    towers: true,
    groups: [
      { key: "pending", label: "Pending", tone: "" },
      { key: "completed", label: "Completed", tone: "is-green" }
    ],
    columns: [
      { label: "RFI ID", cell: (r) => r.id },
      { label: "Query", cell: (r) => oiTitle(r.query, `Received ${r.received} · 📎 ${r.files} files`, r.blocking ? '<span class="badge blocking">Blocking</span>' : "") },
      { label: "Wing No.", cell: (r) => r.wing },
      { label: "Impact", cell: (r) => r.impact },
      { label: "Discipline", cell: (r) => r.disc },
      { label: "Raised By", cell: (r) => r.by },
      { label: "Action", cell: (r) => oiAction(r.action) }
    ],
    rows: [
      { id: "RFI-209", query: "MCB Rating Clarification", blocking: true, received: "2h ago", files: 2, wing: "Wing 25", impact: "None", disc: "Electrical", by: "Sachin Patil", due: "today", group: "pending", action: "Respond" },
      { id: "RFI-209", query: "MCB Rating Clarification", received: "2h ago", files: 2, wing: "Wing 25", impact: "None", disc: "Electrical", by: "Sachin Patil", due: "tomorrow", group: "pending", action: "Respond" },
      { id: "RFI-209", query: "Issue Revised Infra Fire Layout", received: "2h ago", files: 2, wing: "Wing 25", impact: "None", disc: "Electrical", by: "Sachin Patil", due: "overdue", group: "pending", action: "Respond" },
      { id: "RFI-209", query: "MCB Rating Clarification", blocking: true, received: "2h ago", files: 2, wing: "Wing 25", impact: "None", disc: "Electrical", by: "Sachin Patil", due: "week", group: "pending", action: "Respond" },
      { id: "RFI-209", query: "MCB Rating Clarification", blocking: true, received: "2h ago", files: 2, wing: "Wing 25", impact: "None", disc: "Electrical", by: "Sachin Patil", due: "week", group: "pending", action: "Respond" },
      { id: "RFI-211", query: "Issue Revise Infra Fire Layout", received: "3d ago", files: 1, wing: "Tower B", impact: "Cost", disc: "Firefighting", by: "Rohit Patil", due: "", group: "completed", action: "View" }
    ]
  },

  // The Deliverables design wasn't in your screenshots, so this layout is my guess
  deliverables: {
    title: "Deliverables",
    checkbox: true,
    groups: [
      { key: "pending", label: "Pending", tone: "" },
      { key: "completed", label: "Completed", tone: "is-green" }
    ],
    columns: [
      { label: "Document Name", cell: (r) => oiTitle(r.title, r.sub + (r.waiting ? waiting(r.waiting) : ""), oiBadge(r.priority)) },
      { label: "Project Name", cell: (r) => r.project },
      { label: "Status", cell: (r) => `<span class="task-state ${r.state}">${r.stateLabel}</span>` },
      { label: "Due Date", cell: (r) => (r.group === "completed" ? "—" : oiDue(r.dueLabel, r.due)) },
      { label: "Action", cell: (r) => (r.action ? oiAction(r.action) : "") }
    ],
    rows: [
      { title: "Issue Fire Tender Package", sub: "Fire", waiting: "MEP Consultant", priority: "High", project: "Lodha One • Tower B", state: "delayed", stateLabel: "Delayed", due: "overdue", dueLabel: "Overdue", group: "pending", action: "Remind" },
      { title: "Issue Coordinated Typical Floor GFC", sub: "Coordinated", priority: "Medium", project: "Lodha Amara • Wing 25", state: "in-progress", stateLabel: "In Progress", due: "today", dueLabel: "Due Today", group: "pending" },
      { title: "Issue Revised Infra Fire Layout", sub: "Fire", waiting: "Architect", priority: "Medium", project: "Palava • Phase 2", state: "pending", stateLabel: "Pending", due: "tomorrow", dueLabel: "Due Tomorrow", group: "pending", action: "Remind" }
    ]
  }
};

function buildOpenItemsPanel(key) {
  const cfg = openItemsConfig[key];
  const panel = document.querySelector(`[data-open-panel="${key}"]`);
  if (!panel) return;
  const colCount = cfg.columns.length + (cfg.checkbox ? 1 : 0);

  const rowHtml = (r) => `
    <tr class="project-task-row oi-row${r.group === "completed" ? " done" : ""}" data-oi-row data-group="${r.group}" data-origin="${r.group === "completed" ? cfg.groups[0].key : r.group}" data-due="${r.due || ""}">
      ${cfg.checkbox ? `<td><label class="custom-checkbox"><input class="task-checkbox oi-check" type="checkbox" aria-label="Complete ${r.title}" ${r.group === "completed" ? "checked" : ""}><span class="checkbox-box"></span></label></td>` : ""}
      ${cfg.columns.map((c) => `<td>${c.cell(r)}</td>`).join("")}
    </tr>`;

  const groupHtml = (g) => `
    <tr class="project-task-group-row" data-oi-group="${g.key}"><th colspan="${colCount}">
      <button class="task-group-toggle" type="button" aria-expanded="true"><span class="task-group-chevron" aria-hidden="true"></span><span>${g.label}</span><span class="task-group-count ${g.tone}" data-oi-count></span></button>
    </th></tr>
    ${cfg.rows.filter((r) => r.group === g.key).map(rowHtml).join("")}`;

  panel.classList.add("project-tasks-view");
  panel.innerHTML = `
    <div class="project-task-toolbar">
      <div class="task-priority-filters" role="group" aria-label="Filter by due date">
        <button class="task-priority-filter is-active" type="button" data-oi-due="all" aria-pressed="true">All</button>
        <button class="task-priority-filter" type="button" data-oi-due="overdue" aria-pressed="false">Overdue</button>
        <button class="task-priority-filter" type="button" data-oi-due="today" aria-pressed="false">Due Today</button>
        <button class="task-priority-filter" type="button" data-oi-due="tomorrow" aria-pressed="false">Due Tomorrow</button>
        <button class="task-priority-filter" type="button" data-oi-due="week" aria-pressed="false">Due in next 7 days</button>
      </div>
      <span class="oi-divider"></span>
      <button class="task-advanced-filter-button" type="button">
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5h14M6 10h8m-5 5h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>Filters
      </button>
      <label class="project-task-search">
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" stroke-width="1.8"/><path d="m13.2 13.2 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <input type="search" data-oi-search aria-label="Search ${cfg.title}" placeholder="Search tasks...">
      </label>
      ${cfg.addLabel ? `<button class="project-task-add create-task-btn" type="button"><span aria-hidden="true">+</span> ${cfg.addLabel}</button>` : ""}
      ${cfg.towers ? `<button class="tower-filter" type="button"><span class="tower-filter-label">All Towers</span><span class="select-chevron" aria-hidden="true"></span></button>` : ""}
    </div>

    <div class="project-task-table-scroll">
      <table class="data-table project-task-table oi-table">
        <thead><tr>${cfg.checkbox ? '<th scope="col" aria-label="Complete"></th>' : ""}${cfg.columns.map((c) => `<th scope="col">${c.label}</th>`).join("")}</tr></thead>
        <tbody>${cfg.groups.map(groupHtml).join("")}</tbody>
      </table>
    </div>
    <footer class="project-task-pagination">Page 1 of 1</footer>`;

  const body = panel.querySelector("tbody");
  const search = panel.querySelector("[data-oi-search]");
  let dueFilter = "all";
  const dueMatches = { all: null, overdue: ["overdue"], today: ["today"], tomorrow: ["tomorrow"], week: ["today", "tomorrow", "week"] };

  function refresh() {
    const q = search.value.trim().toLocaleLowerCase();
    const allowed = dueMatches[dueFilter];
    cfg.groups.forEach((g) => {
      const header = body.querySelector(`[data-oi-group="${g.key}"]`);
      const open = header.querySelector(".task-group-toggle").getAttribute("aria-expanded") === "true";
      let matching = 0;
      body.querySelectorAll(`[data-oi-row][data-group="${g.key}"]`).forEach((row) => {
        const ok = (!allowed || allowed.includes(row.dataset.due)) && row.textContent.toLocaleLowerCase().includes(q);
        row.hidden = !ok || !open;
        if (ok) matching += 1;
      });
      header.hidden = matching === 0;
      header.querySelector("[data-oi-count]").textContent = String(matching).padStart(2, "0");
    });
  }

  panel.querySelectorAll("[data-oi-due]").forEach((chip) => {
    chip.addEventListener("click", () => {
      dueFilter = chip.dataset.oiDue;
      panel.querySelectorAll("[data-oi-due]").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      refresh();
    });
  });

  search.addEventListener("input", refresh);

  body.addEventListener("click", (e) => {
    const toggle = e.target.closest(".task-group-toggle");
    if (!toggle) return;
    toggle.setAttribute("aria-expanded", String(toggle.getAttribute("aria-expanded") !== "true"));
    refresh();
  });

  body.addEventListener("change", (e) => {
    const check = e.target.closest(".oi-check");
    if (!check) return;
    const row = check.closest("[data-oi-row]");
    row.classList.toggle("done", check.checked);
    row.dataset.group = check.checked ? "completed" : row.dataset.origin;
    body.querySelector(`[data-oi-group="${row.dataset.group}"]`).after(row);
    refresh();
  });

  refresh();
}

Object.keys(openItemsConfig).forEach(buildOpenItemsPanel);

/* EMAIL OVERLAY */
const mailTrigger = document.querySelector(".mail-trigger");
const mailOverlay = document.getElementById("mail-overlay");
const mailList = document.getElementById("mail-list");

const unreadEmails = [
  { name: "Arjun Mehta", time: "8 min ago",  subject: "Need decision on facade bracket detail",     preview: "We are holding the package until this detail is confirmed by the facade consultant.", project: "Riverside HQ" },
  { name: "Priya Nair",  time: "32 min ago", subject: "Approval required: MEP routing report",       preview: "Could you review the two highlighted clashes before the coordination call tomorrow?", project: "Northline Campus" },
  { name: "Maya Chen",   time: "1 hr ago",   subject: "Authority response has arrived",              preview: "The fire strategy comments are now in the shared folder for your review.", project: "Harbour Point" },
  { name: "Klara Singh", time: "2 hr ago",   subject: "Door hardware schedule — your input needed",  preview: "The access control team has updated their requirements for the main lobby doors.", project: "Northline Campus" }
];

const mailInitials = (name) => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

mailList.innerHTML = unreadEmails.map((m) => `
  <li class="mail-item">
    <span class="mail-avatar">${mailInitials(m.name)}</span>
    <div class="mail-item-head">
      <strong class="mail-sender">${m.name}</strong>
      <span class="mail-time">${m.time}</span>
    </div>
    <div class="mail-item-body">
      <p class="mail-subject">${m.subject}</p>
      <p class="mail-preview">${m.preview}</p>
      <span class="mail-project">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.33 6.67c0 3.33-3.69 6.8-4.93 7.87a.67.67 0 0 1-.8 0C6.36 13.47 2.67 10 2.67 6.67a5.33 5.33 0 0 1 10.66 0Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="8" cy="6.67" r="2" fill="currentColor"/></svg>
        ${m.project}
      </span>
    </div>
  </li>`).join("");

function setMailOpen(open) {
  mailOverlay.hidden = !open;
  mailTrigger.setAttribute("aria-expanded", String(open));
}

mailTrigger.addEventListener("click", () => {
  const opening = mailOverlay.hidden;
  setProfileOpen(false);
  setRoleMenuOpen(false);
  setMailOpen(opening);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".mail-menu")) setMailOpen(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !mailOverlay.hidden) {
    setMailOpen(false);
    mailTrigger.focus();
  }
});

/* PROJECT RFIs */
const rfiData = [
  { id: "RFI-209", query: "MCB Rating Clarification", blocking: true, received: "2h ago", files: 2, wing: "Wing 25", impact: "None", discipline: "Electrical", by: "Sachin Patil", status: "in-progress" },
  { id: "RFI-209", query: "MCB Rating Clarification", received: "2h ago", files: 2, wing: "Wing 25", impact: "None", discipline: "Electrical", by: "Sachin Patil", status: "in-progress" },
  { id: "RFI-209", query: "Issue Revised Infra Fire Layout", received: "2h ago", files: 2, wing: "Wing 25", impact: "None", discipline: "Electrical", by: "Sachin Patil", status: "delayed" },
  { id: "RFI-209", query: "MCB Rating Clarification", blocking: true, received: "2h ago", files: 2, wing: "Wing 25", impact: "None", discipline: "Electrical", by: "Sachin Patil", status: "in-progress" },
  { id: "RFI-209", query: "MCB Rating Clarification", blocking: true, received: "2h ago", files: 2, wing: "Wing 25", impact: "None", discipline: "Electrical", by: "Sachin Patil", status: "in-progress" },
  { id: "RFI-211", query: "Issue Revise Infra Fire Layout", wing: "Tower B", impact: "Cost", discipline: "Firefighting", by: "Rohit Patil", status: "completed" }
];

const rfiGroups = [
  { key: "pending", label: "Pending", tone: "", statuses: ["in-progress", "delayed"] },
  { key: "completed", label: "Completed", tone: "is-green", statuses: ["completed"] }
];

const rfiList = document.getElementById("project-rfi-list");
const rfiSearch = document.getElementById("project-rfi-search");
const rfiDisciplineFilter = document.getElementById("rfi-discipline-filter");
const rfiFilterBtn = document.getElementById("rfi-filter-btn");
const rfiFilterMenu = document.getElementById("rfi-advanced-filters");
let rfiStatusFilter = "all";
const rfiCollapsed = new Set();

const rfiClipIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg>';
const rfiSendIcon = '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>';
const rfiEyeIcon = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';

function rfiMatches(r) {
  const q = rfiSearch.value.trim().toLocaleLowerCase();
  const statusOk = rfiStatusFilter === "all" || r.status === rfiStatusFilter;
  const disciplineOk = rfiDisciplineFilter.value === "all" || r.discipline === rfiDisciplineFilter.value;
  const text = `${r.id} ${r.query} ${r.discipline} ${r.by} ${r.wing}`.toLocaleLowerCase();
  return statusOk && disciplineOk && text.includes(q);
}

function rfiRowHtml(r) {
  const done = r.status === "completed";
  const sub = done ? "" : `<span class="row-subtitle">Received ${r.received} · ${rfiClipIcon} ${r.files} files</span>`;
  const blocking = r.blocking ? '<span class="badge blocking">Blocking</span>' : "";
  const action = done
    ? { label: "View", icon: rfiEyeIcon }
    : { label: "Respond", icon: rfiSendIcon };

  return `
    <tr class="project-task-row${done ? " done" : ""}">
      <td>${r.id}</td>
      <td><strong>${r.query}</strong>${blocking}${sub}</td>
      <td>${r.wing}</td>
      <td>${r.impact}</td>
      <td>${r.discipline}</td>
      <td>${r.by}</td>
      <td><button class="comment-btn" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${action.icon}</svg>${action.label}</button></td>
    </tr>`;
}

function renderRfis() {
  const html = rfiGroups.map((g) => {
    const rows = rfiData.filter((r) => g.statuses.includes(r.status) && rfiMatches(r));
    if (!rows.length) return "";
    const open = !rfiCollapsed.has(g.key);
    return `
      <tr class="project-task-group-row"><th colspan="7">
        <button class="task-group-toggle" type="button" data-rfi-toggle="${g.key}" aria-expanded="${open}"><span class="task-group-chevron" aria-hidden="true"></span><span>${g.label}</span><span class="task-group-count ${g.tone}">${String(rows.length).padStart(2, "0")}</span></button>
      </th></tr>
      ${open ? rows.map(rfiRowHtml).join("") : ""}`;
  }).join("");

  rfiList.innerHTML = html || '<tr><td colspan="7" class="drawer-empty" style="padding:24px">No RFIs match these filters.</td></tr>';
}

document.querySelectorAll("[data-rfi-status]").forEach((chip) => {
  chip.addEventListener("click", () => {
    rfiStatusFilter = chip.dataset.rfiStatus;
    document.querySelectorAll("[data-rfi-status]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderRfis();
  });
});

rfiSearch.addEventListener("input", renderRfis);
rfiDisciplineFilter.addEventListener("change", renderRfis);

rfiFilterBtn.addEventListener("click", () => {
  const expanded = rfiFilterBtn.getAttribute("aria-expanded") === "true";
  rfiFilterBtn.setAttribute("aria-expanded", String(!expanded));
  rfiFilterMenu.hidden = expanded;
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".task-advanced-filter-wrap")) {
    rfiFilterBtn.setAttribute("aria-expanded", "false");
    rfiFilterMenu.hidden = true;
  }
});

rfiList.addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-rfi-toggle]");
  if (!toggle) return;
  const key = toggle.dataset.rfiToggle;
  if (rfiCollapsed.has(key)) rfiCollapsed.delete(key);
  else rfiCollapsed.add(key);
  renderRfis();
});

// Download whatever the current filters show as a CSV file
document.getElementById("project-rfi-download").addEventListener("click", () => {
  const header = ["RFI ID", "Query", "Wing No.", "Impact", "Discipline", "Raised By", "Status"];
  const rows = rfiData.filter(rfiMatches).map((r) => [r.id, r.query, r.wing, r.impact, r.discipline, r.by, r.status]);
  const csv = [header, ...rows].map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "rfis.csv";
  link.click();
  URL.revokeObjectURL(link.href);
});

renderRfis();