const searchInput = document.querySelector('.search input');
const dashboardTasksBody = document.querySelector('#tasks-table tbody');
const taskCount = document.querySelector('.panel-count');

function updateTaskCount() {
  const taskCheckboxes = Array.from(dashboardTasksBody.querySelectorAll('.task-checkbox'));
  const completed = taskCheckboxes.filter((checkbox) => checkbox.checked).length;
  taskCount.textContent = `${completed}/${taskCheckboxes.length}`;
}

// The topbar search filters whatever list the current page shows
function filterTasks() {
  const query = searchInput.value.trim().toLocaleLowerCase();

  if (!projectsView.hidden) {
    projectSearchInput.value = searchInput.value;
    filterProjectCards();
    return;
  }

  if (!libraryView.hidden) {
    if (currentLibraryTab === "makes") {
      makesSearch.value = searchInput.value;
      renderMakes();
      return;
    }
    policySearchInput.value = searchInput.value;
    filterPolicies();
    return;
  }

  document.querySelectorAll('#tasks-table tbody tr, #rfiTable tbody tr, #deliverables-table tbody tr').forEach((row) => {
    row.hidden = !row.textContent.toLocaleLowerCase().includes(query);
  });
}

dashboardTasksBody.addEventListener('change', (event) => {
  const checkbox = event.target.closest('.task-checkbox');
  if (!checkbox) return;
  checkbox.closest('tr').classList.toggle('done', checkbox.checked);
  updateTaskCount();
});
searchInput.addEventListener('input', filterTasks);

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});

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
const projectSearchInput = document.querySelector('#project-search');
const projectStatusFilter = document.querySelector('#project-status-filter');
const starredProjectsFilter = document.querySelector('.starred-filter');
const projectCards = Array.from(document.querySelectorAll('[data-project-card]'));
const emptyProjectsMessage = document.querySelector('.empty-projects');
const datePickers = Array.from(projectDialog.querySelectorAll('.date-picker'));
let dialogReturnFocus = null;

// Sidebar views (dashboard, projects, library, reporting)
function setCurrentView(viewName) {
  showPage(viewName);

  if (viewName === 'library') {
    setLibraryTab(currentLibraryTab);
    return;
  }

  renderBreadcrumb([{ label: sidebarLabel(viewName) }]);
  syncHash(viewName === 'dashboard' ? '' : viewName);
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

// Sidebar, breadcrumb and KPI links all carry data-view-target
document.addEventListener('click', (event) => {
  const link = event.target.closest('[data-view-target]');
  if (!link) return;
  event.preventDefault();
  setCurrentView(link.dataset.viewTarget);
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

// Measurements come back in screen pixels, but the panel's fixed top/left get scaled by the
// page zoom (--app-zoom), so convert everything to CSS pixels first
function positionCalendar(datePicker) {
  const panel = datePicker.querySelector('.calendar-panel');
  const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  const toCss = (rect) => ({ left: rect.left / zoom, top: rect.top / zoom, bottom: rect.bottom / zoom, width: rect.width / zoom, height: rect.height / zoom });
  const triggerRect = toCss(datePicker.querySelector('summary').getBoundingClientRect());
  const panelRect = toCss(panel.getBoundingClientRect());
  const viewportWidth = window.innerWidth / zoom;
  const viewportHeight = window.innerHeight / zoom;
  const edgePadding = 12;
  const left = Math.min(Math.max(edgePadding, triggerRect.left), viewportWidth - panelRect.width - edgePadding);
  const roomBelow = viewportHeight - triggerRect.bottom - edgePadding;
  const roomAbove = triggerRect.top - edgePadding;
  const top = roomBelow >= panelRect.height || roomBelow >= roomAbove
    ? Math.min(triggerRect.bottom + 8, viewportHeight - panelRect.height - edgePadding)
    : Math.max(edgePadding, triggerRect.top - panelRect.height - 8);

  panel.style.setProperty('--calendar-panel-top', `${top}px`);
  panel.style.setProperty('--calendar-panel-left', `${left}px`);
}

function selectCalendarDate(datePicker, date) {
  const dateInput = document.getElementById(datePicker.dataset.datePicker);
  dateInput.value = formatDateInput(date);
  datePicker.viewDate = new Date(date.getFullYear(), date.getMonth(), 1);
  renderCalendar(datePicker);
  datePicker.open = false;
  dateInput.dispatchEvent(new Event('change', { bubbles: true }));
}

// One calendar for every date field: the Create Project pickers in the HTML, plus any
// native <input type="date"> that enhanceDateInputs() swaps for the same picker
const formatPickerDate = (date) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
const allDatePickers = () => Array.from(document.querySelectorAll('.date-picker'));

function syncDatePickerLabel(datePicker) {
  const dateInput = document.getElementById(datePicker.dataset.datePicker);
  if (!dateInput) return;
  const date = parseDateInput(dateInput.value);
  datePicker.querySelector('.date-picker-value').textContent = date ? formatPickerDate(date) : datePicker.dataset.placeholder;
  datePicker.classList.toggle('has-value', Boolean(date));
}

// Code all over the app sets input.value directly; keep the picker label in step with it
const nativeInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
function watchDateValue(dateInput, datePicker) {
  Object.defineProperty(dateInput, 'value', {
    configurable: true,
    get() { return nativeInputValue.get.call(this); },
    set(value) {
      nativeInputValue.set.call(this, value);
      syncDatePickerLabel(datePicker);
    }
  });
  dateInput.form?.addEventListener('reset', () => setTimeout(() => syncDatePickerLabel(datePicker)));
}

function setupDatePicker(datePicker) {
  if (datePicker.dataset.ready) return;
  datePicker.dataset.ready = 'true';
  const dateInput = document.getElementById(datePicker.dataset.datePicker);

  datePicker.addEventListener('toggle', () => {
    if (datePicker.open) {
      allDatePickers().forEach((otherPicker) => {
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
    datePicker.viewDate = new Date();
    renderCalendar(datePicker);
    datePicker.open = false;
    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
  });

  datePicker.querySelector('.calendar-today').addEventListener('click', () => {
    selectCalendarDate(datePicker, new Date());
  });

  // A required date left empty opens its calendar instead of a hidden validation bubble
  dateInput.addEventListener('invalid', () => {
    datePicker.open = true;
    datePicker.querySelector('summary').focus();
  });

  // Clicking the field's label opens the calendar rather than the hidden native input
  Array.from(dateInput.labels || []).forEach((label) => {
    label.addEventListener('click', (event) => {
      if (datePicker.contains(event.target)) return;
      event.preventDefault();
      datePicker.open = !datePicker.open;
      datePicker.querySelector('summary').focus();
    });
  });

  watchDateValue(dateInput, datePicker);
  syncDatePickerLabel(datePicker);
}

const calendarSummaryIcon = '<svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><rect x="3" y="4.5" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M6.5 2.5v4M13.5 2.5v4M3.5 8h13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
const calendarPanelHtml = `
  <div class="calendar-panel">
    <div class="calendar-topline"><button class="calendar-back" type="button" aria-label="Previous month">‹</button><div><strong class="calendar-selected-date">Select a date</strong><span class="calendar-week"></span></div><button class="calendar-open-native" type="button" aria-label="Go to selected month">▦</button></div>
    <div class="calendar-monthbar"><strong class="calendar-month-label"></strong><div><button class="calendar-month-prev" type="button" aria-label="Previous month">⌃</button><button class="calendar-month-next" type="button" aria-label="Next month">⌄</button></div></div>
    <div class="calendar-weekdays" aria-hidden="true"><span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span></div>
    <div class="calendar-days" role="grid" aria-label="Calendar dates"></div>
    <div class="calendar-footer"><button class="calendar-clear" type="button">Clear</button><button class="calendar-today" type="button">Today</button></div>
  </div>`;
let dateInputSeq = 0;

function enhanceDateInputs(root = document) {
  const dateInputs = root.matches?.('input[type="date"]') ? [root] : Array.from(root.querySelectorAll?.('input[type="date"]') || []);
  dateInputs.filter((input) => !input.classList.contains('date-value-input')).forEach((dateInput) => {
    if (!dateInput.id) dateInput.id = `date-field-${++dateInputSeq}`;
    const label = (dateInput.getAttribute('aria-label') || dateInput.labels?.[0]?.textContent || 'date').replace('*', '').trim();
    dateInput.classList.add('visually-hidden', 'date-value-input');
    dateInput.tabIndex = -1;
    dateInput.setAttribute('aria-hidden', 'true');

    const datePicker = document.createElement('details');
    datePicker.className = 'date-picker';
    datePicker.dataset.datePicker = dateInput.id;
    datePicker.dataset.placeholder = dateInput.dataset.placeholder || 'Select date';
    datePicker.innerHTML = `<summary aria-label="Choose ${escapeHtml(label.toLowerCase())}"><span class="date-picker-value"></span>${calendarSummaryIcon}</summary>${calendarPanelHtml}`;

    // Drawer fields wrap the input in a bordered control; the picker brings its own border
    const wrapper = dateInput.closest('.drawer-control');
    (wrapper || dateInput).after(datePicker);
    if (wrapper) wrapper.hidden = true;
    setupDatePicker(datePicker);
  });
}

datePickers.forEach(setupDatePicker);

document.addEventListener('click', (event) => {
  allDatePickers().forEach((datePicker) => {
    if (datePicker.open && !datePicker.contains(event.target)) datePicker.open = false;
  });
});

// Esc closes an open calendar first, before it can close the dialog or drawer underneath
window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  const openPicker = document.querySelector('.date-picker[open], .ui-select[open]');
  if (!openPicker) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  openPicker.open = false;
  openPicker.querySelector('summary').focus();
}, true);

window.addEventListener('resize', () => {
  allDatePickers().filter((datePicker) => datePicker.open).forEach(positionCalendar);
});

document.addEventListener('scroll', () => {
  allDatePickers().filter((datePicker) => datePicker.open).forEach(positionCalendar);
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
    syncDatePickerLabel(datePicker);
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

const taskAttachmentInput = document.querySelector('#task-attachment');
const taskUploadText = document.querySelector('.task-upload-text');

function openTaskDialog(assignee = '') {
  taskDialogBackdrop.hidden = false;
  document.body.classList.add('project-dialog-open');
  taskAssigneeInput.value = assignee;
  document.querySelector('#task-title').focus();
}

function closeTaskDialog() {
  taskDialogBackdrop.hidden = true;
  document.body.classList.remove('project-dialog-open');
  taskForm.reset();
  taskUploadText.textContent = taskUploadText.dataset.defaultLabel;
}

document.querySelector('.add-btn[aria-label="Add task"]').addEventListener('click', () => openTaskDialog());

// Every "Create Task" / "Add Task" button (overview header, project tasks, open items)
document.addEventListener('click', (event) => {
  if (event.target.closest('.create-task-btn')) openTaskDialog();
});

taskAttachmentInput.addEventListener('change', () => {
  const names = Array.from(taskAttachmentInput.files, (file) => file.name);
  taskUploadText.textContent = names.length ? names.join(', ') : taskUploadText.dataset.defaultLabel;
});

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

  const task = {
    title: document.getElementById('task-title').value.trim(),
    description: document.getElementById('task-description').value.trim(),
    priority: document.getElementById('task-priority').value,
    discipline: document.getElementById('task-discipline').value,
    targetDate: document.getElementById('task-date').value,
    assignee: taskAssigneeInput.value.trim()
  };

  // The new task lands in the list the user is looking at
  if (!overviewPage.hidden) addProjectTask(task);
  else if (!openItemsPage.hidden) addOpenItemsTask(task);
  else if (!dashboardView.hidden) addDashboardTask(task);

  closeTaskDialog();
  showToast('Task created successfully.');
});

function showToast(message) {
  document.querySelectorAll('.project-toast').forEach((toast) => toast.remove());
  const toast = document.createElement('div');
  toast.className = 'project-toast';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  document.body.append(toast);
  window.setTimeout(() => toast.remove(), 3500);
}

/* BREADCRUMB */
function renderBreadcrumb(trail) {
  const items = [{ label: "Atelier", view: "dashboard" }, ...trail];

  document.getElementById("breadcrumb").innerHTML = items
    .map((item, i) =>
      i === items.length - 1
        ? `<span class="current">${escapeHtml(item.label)}</span>`
        : item.route
          ? `<a href="#${item.route}" data-route="${item.route}">${escapeHtml(item.label)}</a>`
          : `<a href="#${item.view}" data-view-target="${item.view}">${escapeHtml(item.label)}</a>`
    )
    .join("<span>›</span>");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]
  ));
}

function sidebarLabel(key) {
  const link = document.querySelector(`.nav-bar [data-view-target="${key}"]`);
  return link ? link.textContent.trim() : "Dashboard";
}


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

const projectSubViews = {
  tasks: projectTasksView,
  rfis: projectRfisView,
  transmittals: document.getElementById("project-transmittals-view"),
  deliverables: document.getElementById("project-deliverables-view"),
  files: document.getElementById("project-files-view"),
  team: document.getElementById("project-team-view"),
  milestones: document.getElementById("project-milestones-view"),
  activity: document.getElementById("project-activity-view")
};
const projectViewLabels = {
  tasks: "Tasks", rfis: "RFIs", deliverables: "Deliverables", transmittals: "Transmittals", files: "Files",
  team: "Team", milestones: "Milestones", activity: "Activity"
};

function setProjectView(viewName) {
  if (viewName !== "overview" && !projectSubViews[viewName]) viewName = "overview";
  const showOverview = viewName === "overview";
  projectHeader.hidden = !showOverview;
  projectHeaderCard.hidden = !showOverview;
  projectOverviewContent.hidden = !showOverview;
  Object.entries(projectSubViews).forEach(([key, view]) => { view.hidden = key !== viewName; });

  // Milestones and Activity have no tab of their own, so Overview stays highlighted
  const activeTab = viewName === "milestones" || viewName === "activity" ? "overview" : viewName;
  document.querySelectorAll("[data-project-view]").forEach((tab) => {
    const isActive = tab.dataset.projectView === activeTab;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  const name = overviewPage.querySelector(".project-title").textContent;
  const tabLabel = projectViewLabels[viewName];
  renderBreadcrumb(tabLabel
    ? [{ label: "Projects", view: "projects" }, { label: name, route: "project/overview" }, { label: tabLabel }]
    : [{ label: "Projects", view: "projects" }, { label: name }]);
  syncHash(`project/${viewName}`);
  document.querySelector(".main-content").scrollTop = 0;
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
  if (!action || action.dataset.rowAction === "remind") return;
  const row = action.closest("[data-task-row]");
  if (row) {
    row.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    document.getElementById("drawer-comment-input").focus();
  }
});

function openProject(name, tab = "overview") {
  showPage("overview");
  overviewPage.querySelector(".project-title").textContent = name;
  setProjectView(tab);
}

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-project-card]");
  if (!card || e.target.closest(".project-star")) return;
  e.preventDefault();
  openProject(card.querySelector("h2").textContent);
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

// Meetings on later days at a fixed local time
const onDay = (dayOffset, hours, minutes) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const meetings = [
  { id: "m1", start: inMinutes(12),  end: inMinutes(102), title: "Elanor Coordination Meeting", type: "online",    place: "Teams link",            project: "Lodha Belmondo", attendees: 5, status: "join" },
  { id: "m2", start: inMinutes(150), end: inMinutes(210), title: "MEP Design Review",           type: "in-person", place: "Belle, 36th Floor, OLP", project: "Lodha One",      attendees: 8, status: "join" },
  { id: "m3", start: inMinutes(300), end: inMinutes(360), title: "Fire Strategy Call",          type: "online",    place: "Teams link",            project: "Palava",         attendees: 12, status: "going" },
  { id: "m4", start: onDay(1, 10, 0),  end: onDay(1, 11, 0),  title: "HVAC Shop Drawing Review",     type: "in-person", place: "Site office, Tower 26", project: "Lodha Belmondo", attendees: 6, status: "join" },
  { id: "m5", start: onDay(1, 15, 30), end: onDay(1, 16, 15), title: "Consultant Weekly Sync",       type: "online",    place: "Teams link",            project: "Lodha Amara",    attendees: 9, status: "join" },
  { id: "m6", start: onDay(3, 11, 0),  end: onDay(3, 12, 30), title: "Plumbing Riser Coordination", type: "in-person", place: "Belle, 36th Floor, OLP", project: "Lodha One",      attendees: 7, status: "join" }
];
let meetingSeq = meetings.length;

const formatTime = (d) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function getChip(m) {
  if (m.joined) return { text: m.type === "online" ? "Joined" : "Attending", cls: "live" };
  const mins = Math.round((m.start - Date.now()) / 60000);
  if (mins <= 0) return { text: "Live now", cls: "live" };
  if (mins < 60) return { text: `In ${mins} min`, cls: "soon" };
  if (mins < 24 * 60) return { text: `In ${Math.floor(mins / 60)} h`, cls: "" };
  return { text: `In ${Math.round(mins / (24 * 60))} d`, cls: "" };
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
    <article class="meeting-card" tabindex="0" data-meeting-id="${m.id}" data-date="${new Date(m.start - m.start.getTimezoneOffset() * 60000).toISOString().slice(0, 10)}">
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
          <strong class="meeting-title">${escapeHtml(m.title)}</strong>
          <span class="meeting-place">${escapeHtml(m.place)}</span>
          <div class="meeting-tools">
            <button class="meeting-tool" type="button" data-action="notes">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              Notes
            </button>
            <button class="meeting-tool" type="button" data-action="mom">MOM Tracker</button>
          </div>
        </div>

        <div class="meeting-side">
          <button class="meeting-btn" type="button" data-action="join">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>
            Join
          </button>
        </div>
      </div>
    </article>
  `;
}

const isToday = (date) => date.toDateString() === new Date().toDateString();

function renderSchedule() {
  const upcoming = meetings
    .filter((m) => m.end > Date.now() && isToday(m.start))
    .sort((a, b) => a.start - b.start);

  document.getElementById("schedule-list").innerHTML = upcoming.length
    ? upcoming.map(createMeetingCard).join("")
    : `<p class="schedule-empty">No upcoming meetings</p>`;

  const todayCount = meetings.filter((m) => isToday(m.start)).length;
  document.getElementById("metric-meetings").textContent = todayCount;

  if (!meetingsView.hidden) renderMeetingsPage();
}

setInterval(renderSchedule, 60000);

const notesDialogBackdrop = document.getElementById("notes-dialog-backdrop");
const notesSubjectInput = document.getElementById("notes-subject");
const notesDateInput = document.getElementById("notes-date");
let notesDialogReturnFocus = null;

function openNotesDialog(meetingCard) {
  notesDialogReturnFocus = document.activeElement;
  notesSubjectInput.value = meetingCard.querySelector(".meeting-title").textContent;
  notesDateInput.value = meetingCard.dataset.date;
  loadMomIntoNotes();
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
      <div class="overlay-top"><strong>Next meeting</strong><a href="#meetings" class="rail-view-all" data-route="meetings">View All ↗</a></div>
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
        <a href="#reporting" class="rail-view-all" data-view-target="reporting">Details ↗</a>
      </div>
      ${row("success", "Completed", healthData.completed)}
      ${row("progress", "In progress", healthData.progress)}
      ${row("delayed", "Delayed", healthData.delayed)}
    `;
  }
};

const railToday = new Date();
const nextMeetingToday = meetings
  .filter((m) => m.end > Date.now() && isToday(m.start))
  .sort((a, b) => a.start - b.start)[0];

const railMiniItems = [
  { icon: "calendar", label: "Calendar",        sub: `${railToday.toLocaleDateString("en-GB", { weekday: "short" })}, ${String(railToday.getDate()).padStart(2, "0")} · ${railToday.toLocaleDateString("en-GB", { month: "short" })}`, divider: true, overlay: "calendar" },
  { icon: "check",    label: "Needs you first", pill: "4 pending",    divider: true, red: true, route: "focus" },
  { icon: "video",    label: "Meetings",        count: String(meetings.filter((m) => isToday(m.start)).length).padStart(2, "0"), sub: nextMeetingToday ? formatTime(nextMeetingToday.start) : "—", overlay: "meeting", route: "meetings" },
  { icon: "cube",     label: "Project health",  pill: "4 delayed",    divider: true, overlay: "health", route: "reporting" }
];

function createRailMiniItem(item) {
  const routeAttrs = item.route ? ` data-route="${item.route}" role="link" tabindex="0" aria-label="Open ${item.label}"` : "";
  return `
    ${item.divider ? '<hr class="rail-mini-divider">' : ""}
    <div class="rail-mini-item"${routeAttrs}>
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
  // Rows store priority in lower case ("medium"), the options in title case
  const selectedOption = options.find((option) => option.dataset.value.toLowerCase() === String(value).toLowerCase()) || options[0];
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

// The priority badge and due chip sit in different columns in each table
const rowPriorityBadge = (row) => row.querySelector(".badge:not(.blocking)");
const rowDueStatus = (row) => row.querySelector(".status");

function updateTaskDueLabel(row, dateValue) {
  const status = rowDueStatus(row);
  if (!status) return;
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
  const row = e.target.closest(".table-scroll tbody tr, .project-task-table:not(.oi-table) tbody tr, [data-open-panel=\"tasks\"] tr[data-oi-row]");
  // Remind / Respond / View buttons have their own dialogs; only Comment opens the drawer
  const commentBtn = e.target.closest(".comment-btn:not([data-row-action]), [data-row-action=\"comment\"]");

  // Row click opens the drawer. The Comment button opens it too.
  if (row && row.cells.length > 2 && (commentBtn || !e.target.closest(".custom-checkbox, button"))) {
    const cells = row.querySelectorAll("td");
    const id = cells[1].textContent.trim();
    const title = row.querySelector("strong").textContent;
    // Dashboard rows show the project; project/open-item rows show the wing
    const project = (row.querySelector(".cell-project") || cells[5]).textContent.trim();
    const assignedBy = cells[6].textContent.trim();
    const checkbox = row.querySelector('.task-checkbox');
    const badge = rowPriorityBadge(row);
    activeTaskRow = row;

    document.getElementById("drawer-meta").textContent = `${id} · ${project} · Assigned by ${assignedBy}`;
    document.getElementById("drawer-title").textContent = title;
    document.getElementById("drawer-description").textContent = row.dataset.description || "No description provided.";
    setDrawerSelect(drawerStatus, row.dataset.taskStatus || (checkbox.checked ? "Completed" : "In Progress"));
    setDrawerSelect(drawerPriority, row.dataset.priority || badge?.textContent.trim() || "Medium");
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
  const priorityBadge = rowPriorityBadge(activeTaskRow);
  const discipline = activeTaskRow.querySelector("td:nth-child(3) .row-subtitle");
  const previousStatus = activeTaskRow.dataset.taskStatus || (checkbox.checked ? "Completed" : "In Progress");
  const previousPriority = activeTaskRow.dataset.priority || priorityBadge?.textContent.trim() || "Medium";
  const previousDate = activeTaskRow.dataset.targetDate || "";
  const previousDiscipline = activeTaskRow.dataset.discipline || discipline?.textContent.trim() || "General";
  const changes = [];

  if (previousStatus !== drawerStatus.dataset.value) changes.push(`Status changed to ${drawerStatus.dataset.value}`);
  if (previousPriority.toLowerCase() !== drawerPriority.dataset.value.toLowerCase()) changes.push(`Priority changed to ${drawerPriority.dataset.value}`);
  if (previousDate !== drawerDueDate.value) changes.push(drawerDueDate.value ? `Target date set to ${drawerDueDate.value}` : "Target date cleared");
  if (previousDiscipline !== drawerDiscipline.value) changes.push(`Discipline changed to ${drawerDiscipline.value}`);

  activeTaskRow.dataset.taskStatus = drawerStatus.dataset.value;
  activeTaskRow.dataset.priority = drawerPriority.dataset.value.toLocaleLowerCase();
  activeTaskRow.dataset.targetDate = drawerDueDate.value;
  activeTaskRow.dataset.discipline = drawerDiscipline.value;
  checkbox.checked = drawerStatus.dataset.value === "Completed";
  activeTaskRow.classList.toggle("done", checkbox.checked);
  if (priorityBadge) {
    priorityBadge.className = `badge ${drawerPriority.dataset.value.toLocaleLowerCase()}`;
    priorityBadge.textContent = drawerPriority.dataset.value;
  }
  // Dashboard rows also show a status chip
  const stateChip = activeTaskRow.querySelector(".task-state");
  if (stateChip) {
    stateChip.className = `task-state ${drawerStatus.dataset.value.toLocaleLowerCase().replace(/\s+/g, "-")}`;
    stateChip.textContent = drawerStatus.dataset.value;
  }
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
const deliverablesBody = document.querySelector("#deliverables-table tbody");
const deliverablesCount = document.querySelector("#dashboard-deliverables-panel .panel-count");

function updateDeliverablesCount() {
  const checks = Array.from(deliverablesBody.querySelectorAll(".task-checkbox"));
  const done = checks.filter((c) => c.checked).length;
  deliverablesCount.textContent = `${done}/${checks.length}`;
}

deliverablesBody.addEventListener("change", (e) => {
  const check = e.target.closest(".task-checkbox");
  if (!check) return;
  check.closest("tr").classList.toggle("done", check.checked);
  updateDeliverablesCount();
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
  syncHash(`open-items/${tab}`);
}

function showOpenItems(tab, dueFilter) {
  if (!openItemsConfig[tab]) tab = "tasks";
  showPage("open-items");
  setOpenItemsTab(tab);
  // e.g. the Delayed Items card opens Tasks already filtered to Overdue
  const chip = document.querySelector(`[data-open-panel="${tab}"] [data-oi-due="${dueFilter || "all"}"]`);
  if (chip) chip.click();
}

document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-open-items]");
  if (card) return showOpenItems(card.dataset.openItems, card.dataset.openFilter);

  const tab = e.target.closest("[data-open-tab]");
  if (tab) setOpenItemsTab(tab.dataset.openTab);
});

// KPI cards and rail items are divs with role="link"; let the keyboard open them too
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const linkLike = e.target.closest('[role="link"][data-open-items], [role="link"][data-route]');
  if (!linkLike || linkLike !== e.target) return;
  e.preventDefault();
  linkLike.click();
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
  return `<button class="comment-btn" type="button" data-row-action="${label.toLowerCase()}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>${label}</button>`;
};
const waiting = (who) => ` · <span class="waiting-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg> Waiting on ${who}</span>`;

const openItemsConfig = {
  tasks: {
    title: "Your Tasks",
    checkbox: true,
    addLabel: "Add Task",
    filter: { label: "Priority", value: (r) => r.priority },
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
    filter: { label: "Discipline", value: (r) => r.disc },
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
    filter: { label: "Status", value: (r) => r.stateLabel },
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
  const panel = document.querySelector(`[data-open-panel="${key}"]`);
  if (panel) buildItemsPanel(panel, openItemsConfig[key], `oi-${key}`);
}

// Grouped table with due-date chips, search, a Filters menu and an optional tower menu.
// Shared by the Open Items tabs and the project Deliverables tab. Rebuilding keeps the filters.
function buildItemsPanel(panel, cfg, key) {
  const colCount = cfg.columns.length + (cfg.checkbox ? 1 : 0);
  const state = panel.itemsState || { due: "all", filter: "all", tower: "all", query: "" };
  panel.itemsState = state;
  const indexed = cfg.rows.map((r, index) => ({ r, index }));
  const filterValues = cfg.filter ? [...new Set(cfg.rows.map(cfg.filter.value))] : [];
  const towerValues = cfg.towers ? [...new Set(cfg.rows.map((r) => r.wing))] : [];
  const dueChips = [["all", "All"], ["overdue", "Overdue"], ["today", "Due Today"], ["tomorrow", "Due Tomorrow"], ["week", "Due in next 7 days"]];

  const rowHtml = (r, index) => `
    <tr class="project-task-row oi-row${r.group === "completed" ? " done" : ""}" data-oi-row data-oi-index="${index}" data-group="${r.group}" data-origin="${r.origin || (r.group === "completed" ? cfg.groups[0].key : r.group)}" data-due="${r.due || ""}" data-filter-value="${escapeHtml(cfg.filter ? cfg.filter.value(r) : "")}" data-wing="${escapeHtml(r.wing || "")}">
      ${cfg.checkbox ? `<td><label class="custom-checkbox"><input class="task-checkbox oi-check" type="checkbox" aria-label="Complete ${escapeHtml(r.title)}" ${r.group === "completed" ? "checked" : ""}><span class="checkbox-box"></span></label></td>` : ""}
      ${cfg.columns.map((c) => `<td>${c.cell(r)}</td>`).join("")}
    </tr>`;

  const groupHtml = (g) => `
    <tr class="project-task-group-row" data-oi-group="${g.key}"><th colspan="${colCount}">
      <button class="task-group-toggle" type="button" aria-expanded="true"><span class="task-group-chevron" aria-hidden="true"></span><span>${g.label}</span><span class="task-group-count ${g.tone}" data-oi-count></span></button>
    </th></tr>
    ${indexed.filter(({ r }) => r.group === g.key).map(({ r, index }) => rowHtml(r, index)).join("")}`;

  panel.classList.add("project-tasks-view");
  panel.innerHTML = `
    <div class="project-task-toolbar">
      <div class="task-priority-filters" role="group" aria-label="Filter by due date">
        ${dueChips.map(([value, label]) => `<button class="task-priority-filter${state.due === value ? " is-active" : ""}" type="button" data-oi-due="${value}" aria-pressed="${state.due === value}">${label}</button>`).join("")}
      </div>
      <span class="oi-divider"></span>
      ${cfg.filter ? `
      <div class="task-advanced-filter-wrap">
        <button class="task-advanced-filter-button" type="button" aria-expanded="false" aria-controls="${key}-filters" data-oi-filter-toggle>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5h14M6 10h8m-5 5h2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>Filters
        </button>
        <div class="task-advanced-filters" id="${key}-filters" hidden>
          <label for="${key}-filter-select">${cfg.filter.label}</label>
          <select id="${key}-filter-select" data-oi-filter>
            <option value="all">All</option>
            ${filterValues.map((value) => `<option${state.filter === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}
          </select>
        </div>
      </div>` : ""}
      <label class="project-task-search">
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" stroke-width="1.8"/><path d="m13.2 13.2 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <input type="search" data-oi-search aria-label="Search ${cfg.title}" placeholder="Search ${cfg.title.toLowerCase()}...">
      </label>
      ${cfg.addLabel ? `<button class="project-task-add create-task-btn" type="button"><span aria-hidden="true">+</span> ${cfg.addLabel}</button>` : ""}
      ${cfg.addAction ? `<button class="project-task-add" type="button" data-project-action="${cfg.addAction.action}"><span aria-hidden="true">+</span> ${cfg.addAction.label}</button>` : ""}
      ${cfg.towers ? `
      <div class="tower-dropdown oi-tower-dropdown">
        <button class="tower-filter" type="button" aria-expanded="false" data-oi-tower-toggle><span class="tower-filter-label">${state.tower === "all" ? "All Towers" : escapeHtml(state.tower)}</span><span class="select-chevron" aria-hidden="true"></span></button>
        <div class="tower-menu" hidden>
          <div class="tower-row"><button class="tower-name" type="button" data-oi-tower="all">All Towers</button></div>
          ${towerValues.map((wing) => `<div class="tower-row"><button class="tower-name" type="button" data-oi-tower="${escapeHtml(wing)}">${escapeHtml(wing)}</button></div>`).join("")}
        </div>
      </div>` : ""}
    </div>

    <div class="project-task-table-scroll">
      <table class="data-table project-task-table oi-table">
        <thead><tr>${cfg.checkbox ? '<th scope="col" aria-label="Complete"></th>' : ""}${cfg.columns.map((c) => `<th scope="col">${c.label}</th>`).join("")}</tr></thead>
        <tbody>${cfg.groups.map(groupHtml).join("")}</tbody>
      </table>
      <p class="policy-empty" data-oi-empty hidden>No items match these filters.</p>
    </div>
    <footer class="project-task-pagination">Page 1 of 1</footer>`;

  const body = panel.querySelector("tbody");
  const search = panel.querySelector("[data-oi-search]");
  const filterSelect = panel.querySelector("[data-oi-filter]");
  const towerMenu = panel.querySelector(".tower-menu");
  const dueMatches = { all: null, overdue: ["overdue"], today: ["today"], tomorrow: ["tomorrow"], week: ["today", "tomorrow", "week"] };
  search.value = state.query;

  function refresh() {
    state.query = search.value;
    const q = search.value.trim().toLocaleLowerCase();
    const allowed = dueMatches[state.due];
    let total = 0;
    cfg.groups.forEach((g) => {
      const header = body.querySelector(`[data-oi-group="${g.key}"]`);
      const open = header.querySelector(".task-group-toggle").getAttribute("aria-expanded") === "true";
      let matching = 0;
      body.querySelectorAll(`[data-oi-row][data-group="${g.key}"]`).forEach((row) => {
        const ok = (!allowed || allowed.includes(row.dataset.due))
          && (state.filter === "all" || row.dataset.filterValue === state.filter)
          && (state.tower === "all" || row.dataset.wing === state.tower)
          && row.textContent.toLocaleLowerCase().includes(q);
        row.hidden = !ok || !open;
        if (ok) matching += 1;
      });
      header.hidden = matching === 0;
      header.querySelector("[data-oi-count]").textContent = String(matching).padStart(2, "0");
      total += matching;
    });
    panel.querySelector("[data-oi-empty]").hidden = total !== 0;
  }

  panel.querySelectorAll("[data-oi-due]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.due = chip.dataset.oiDue;
      panel.querySelectorAll("[data-oi-due]").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-pressed", String(c === chip));
      });
      refresh();
    });
  });

  search.addEventListener("input", refresh);

  panel.querySelector("[data-oi-filter-toggle]")?.addEventListener("click", (e) => {
    const button = e.currentTarget;
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    button.nextElementSibling.hidden = expanded;
  });

  filterSelect?.addEventListener("change", () => {
    state.filter = filterSelect.value;
    refresh();
  });

  panel.querySelector("[data-oi-tower-toggle]")?.addEventListener("click", (e) => {
    towerMenu.hidden = !towerMenu.hidden;
    e.currentTarget.setAttribute("aria-expanded", String(!towerMenu.hidden));
  });

  towerMenu?.addEventListener("click", (e) => {
    const option = e.target.closest("[data-oi-tower]");
    if (!option) return;
    state.tower = option.dataset.oiTower;
    panel.querySelector(".oi-tower-dropdown .tower-filter-label").textContent = option.textContent;
    towerMenu.hidden = true;
    refresh();
  });

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
    const item = cfg.rows[Number(row.dataset.oiIndex)];
    row.classList.toggle("done", check.checked);
    row.dataset.group = check.checked ? "completed" : row.dataset.origin;
    item.group = row.dataset.group;
    item.origin = row.dataset.origin;
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
    <tr class="project-task-row${done ? " done" : ""}" data-rfi-index="${rfiData.indexOf(r)}">
      <td>${r.id}</td>
      <td><strong>${escapeHtml(r.query)}</strong>${blocking}${sub}</td>
      <td>${r.wing}</td>
      <td>${r.impact}</td>
      <td>${r.discipline}</td>
      <td>${r.by}</td>
      <td><button class="comment-btn" type="button" data-row-action="${action.label.toLowerCase()}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${action.icon}</svg>${action.label}</button></td>
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

// Close any open Filters popover or tower menu when clicking elsewhere
document.addEventListener("click", (e) => {
  document.querySelectorAll(".task-advanced-filter-wrap").forEach((wrap) => {
    if (wrap.contains(e.target)) return;
    const menu = wrap.querySelector(".task-advanced-filters");
    if (menu) menu.hidden = true;
    wrap.querySelector(".task-advanced-filter-button")?.setAttribute("aria-expanded", "false");
  });
  document.querySelectorAll(".oi-tower-dropdown").forEach((dropdown) => {
    if (dropdown.contains(e.target)) return;
    dropdown.querySelector(".tower-menu").hidden = true;
    dropdown.querySelector(".tower-filter").setAttribute("aria-expanded", "false");
  });
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
/* PAGE ROUTER */
const appShell = document.querySelector(".app");
const mainContent = document.querySelector(".main-content");
const reportingView = document.getElementById("reporting-view");
const profileView = document.getElementById("profile-view");
const focusView = document.getElementById("focus-view");
const meetingsView = document.getElementById("meetings-view");

const pageSections = {
  dashboard: dashboardView,
  projects: projectsView,
  library: libraryView,
  overview: overviewPage,
  "open-items": openItemsPage,
  reporting: reportingView,
  profile: profileView,
  focus: focusView,
  meetings: meetingsView
};

// Pages without a sidebar entry keep their parent highlighted
const sidebarSection = { overview: "projects", "open-items": "dashboard", focus: "dashboard", meetings: "dashboard", profile: "" };

function showPage(name) {
  if (!pageSections[name]) name = "dashboard";
  Object.entries(pageSections).forEach(([key, section]) => { section.hidden = key !== name; });
  appShell.classList.toggle("project-page-active", name !== "dashboard" && name !== "library");
  appShell.classList.toggle("library-page-active", name === "library");

  const navKey = name in sidebarSection ? sidebarSection[name] : name;
  document.querySelectorAll(".nav-bar [data-view-target]").forEach((link) => {
    const isCurrent = link.dataset.viewTarget === navKey;
    link.classList.toggle("active", isCurrent);
    if (isCurrent) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  if (name === "reporting") renderReporting();
  mainContent.scrollTop = 0;
}

// The URL hash mirrors the page (#reporting, #library/boqs, #project/files) so links and Back work
let lastSyncedHash = null;
const currentHash = () => decodeURIComponent(location.hash.slice(1));

function syncHash(path) {
  lastSyncedHash = path;
  if (currentHash() !== path) location.hash = path;
}

function renderRoute(path) {
  const [page, sub, extra] = path.split("/");
  switch (page) {
    case "doc":
      showDocument(sub, extra);
      break;
    case "projects":
    case "reporting":
      setCurrentView(page);
      break;
    case "library":
      currentLibraryTab = libraryTabs[sub] ? sub : "policies";
      setCurrentView("library");
      break;
    case "open-items":
      showOpenItems(sub);
      break;
    case "project": {
      const title = overviewPage.querySelector(".project-title").textContent;
      const fallback = document.querySelector("[data-project-card] h2").textContent;
      openProject(title === "Project name" ? fallback : title, sub);
      break;
    }
    case "profile":
      showProfile(sub);
      break;
    case "focus":
      showFocus();
      break;
    case "meetings":
      showMeetings(sub);
      break;
    default:
      setCurrentView("dashboard");
  }
}

window.addEventListener("hashchange", () => {
  const path = currentHash();
  if (path === lastSyncedHash) return;
  lastSyncedHash = path;
  renderRoute(path);
});

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-route]");
  if (!link) return;
  // Collapsed-rail items show a hover overlay; clicks inside it belong to the overlay
  if (link.classList.contains("rail-mini-item") && e.target.closest(".rail-overlay")) return;
  e.preventDefault();
  setProfileOpen(false);
  renderRoute(link.dataset.route);
});

document.addEventListener("click", (e) => {
  const link = e.target.closest("[data-project-link]");
  if (!link) return;
  e.preventDefault();
  setProjectView(link.dataset.projectLink);
});

/* SHARED ACTION DIALOG */
const actionBackdrop = document.getElementById("action-dialog-backdrop");
const actionForm = document.getElementById("action-form");
const actionFields = document.getElementById("action-form-fields");
const actionSubmit = document.getElementById("action-submit");
const actionCancel = document.getElementById("action-cancel");
let actionConfig = null;
let actionReturnFocus = null;

const uploadIcon = '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M10 13V3m0 0L6 7m4-4l4 4M3 13v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function actionFieldHtml(field) {
  if (field.type === "row") {
    return `<div class="task-row">${field.fields.map(actionFieldHtml).join("")}</div>`;
  }

  const id = `action-${field.name}`;
  const required = field.required ? " required" : "";
  const star = field.required ? " <span>*</span>" : "";

  if (field.type === "checkbox") {
    return `<label class="action-check"><input type="checkbox" name="${field.name}"${field.value ? " checked" : ""}> ${escapeHtml(field.label)}</label>`;
  }

  // Searchable people picker grouped by team (MEP first); field.exclude hides people already invited
  if (field.type === "people") {
    const exclude = new Set([profileState.name, ...(field.exclude || [])]);
    const groups = teamGroups.map((group) => {
      const people = teamMembers.filter((member) => member.group === group.key && !exclude.has(member.name));
      if (!people.length) return "";
      return `
        <div class="people-group" data-people-group>
          <p class="people-group-title">${escapeHtml(group.label)}</p>
          ${people.map((member) => `
            <label class="action-check people-option" data-people-option>
              <input type="checkbox" name="${field.name}" value="${escapeHtml(member.name)}">
              <span class="member-avatar">${escapeHtml(initialsOf(member.name))}</span>
              <span class="member-copy"><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.role)}</small></span>
            </label>`).join("")}
        </div>`;
    }).join("");
    return `
      <fieldset class="form-field people-field">
        <legend>${escapeHtml(field.label)}</legend>
        <label class="colleague-search people-search">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" stroke-width="2.2"></circle><path d="m16 16 4.2 4.2" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"></path></svg>
          <input type="search" data-people-search placeholder="Search people or teams..." aria-label="Search people">
        </label>
        <div class="people-list">${groups}<p class="no-colleagues" data-people-empty hidden>No one matches.</p></div>
        <p class="people-count" data-people-count aria-live="polite">No one selected</p>
      </fieldset>`;
  }

  if (field.type === "checklist") {
    return `
      <fieldset class="form-field action-checklist">
        <legend>${escapeHtml(field.label)}${star}</legend>
        ${field.options.map((option) => `<label class="action-check"><input type="checkbox" name="${field.name}" value="${escapeHtml(option)}"${field.value?.includes(option) ? " checked" : ""}> ${escapeHtml(option)}</label>`).join("")}
      </fieldset>`;
  }

  let control;
  if (field.type === "textarea") {
    control = `<textarea id="${id}" name="${field.name}" placeholder="${escapeHtml(field.placeholder || "")}"${required}>${escapeHtml(field.value || "")}</textarea>`;
  } else if (field.type === "select") {
    control = `<select id="${id}" name="${field.name}">${field.options.map((option) => `<option${option === field.value ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select>`;
  } else if (field.type === "file") {
    control = `<label class="task-upload" for="${id}"><span class="task-upload-text" data-default-label="Upload Files">Upload Files</span>${uploadIcon}</label>
      <input class="visually-hidden" id="${id}" name="${field.name}" type="file"${field.accept ? ` accept="${field.accept}"` : ""}>`;
  } else {
    const extra = [field.min !== undefined ? ` min="${field.min}"` : "", field.max !== undefined ? ` max="${field.max}"` : ""].join("");
    control = `<input id="${id}" name="${field.name}" type="${field.type || "text"}" value="${escapeHtml(field.value ?? "")}" placeholder="${escapeHtml(field.placeholder || "")}"${extra}${required}>`;
  }

  return `<div class="form-field"><label for="${id}">${escapeHtml(field.label)}${star}</label>${control}</div>`;
}

const flattenFields = (fields = []) => fields.flatMap((field) => (field.type === "row" ? flattenFields(field.fields) : [field]));

function openActionDialog(config) {
  actionConfig = config;
  actionReturnFocus = document.activeElement;
  actionBackdrop.querySelector(".action-dialog").classList.toggle("is-wide", Boolean(config.wide));
  document.getElementById("action-dialog-title").textContent = config.title;
  const subtitle = document.getElementById("action-dialog-subtitle");
  subtitle.textContent = config.subtitle || "";
  subtitle.hidden = !config.subtitle;
  actionFields.innerHTML = `${config.body || ""}${(config.fields || []).map(actionFieldHtml).join("")}<p class="action-error" role="alert" hidden></p>`;
  enhanceDateInputs(actionFields);
  actionSubmit.textContent = config.submitLabel || "Save";
  actionSubmit.hidden = config.submitLabel === null;
  actionCancel.textContent = config.cancelLabel || "Cancel";
  actionBackdrop.hidden = false;
  document.body.classList.add("project-dialog-open");
  (actionFields.querySelector("input:not([type='checkbox']):not([type='file']), textarea, select") || (actionSubmit.hidden ? actionCancel : actionSubmit)).focus();
}

function closeActionDialog() {
  if (actionBackdrop.hidden) return;
  actionBackdrop.hidden = true;
  actionConfig = null;
  if (drawerBackdrop.hidden) document.body.classList.remove("project-dialog-open");
  actionReturnFocus?.focus?.();
}

function setActionError(message) {
  const error = actionFields.querySelector(".action-error");
  error.textContent = message;
  error.hidden = !message;
}

actionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!actionConfig) return;
  if (!actionForm.reportValidity()) return;

  const formData = new FormData(actionForm);
  const values = {};
  flattenFields(actionConfig.fields).forEach((field) => {
    if (field.type === "checklist" || field.type === "people") values[field.name] = formData.getAll(field.name);
    else if (field.type === "checkbox") values[field.name] = formData.has(field.name);
    else if (field.type === "file") values[field.name] = formData.get(field.name)?.name ? formData.get(field.name) : null;
    else values[field.name] = String(formData.get(field.name) ?? "").trim();
  });

  setActionError("");
  if (actionConfig.onSubmit?.(values) === false) return;
  closeActionDialog();
});

actionFields.addEventListener("input", (e) => {
  const search = e.target.closest("[data-people-search]");
  if (!search) return;
  const query = search.value.trim().toLocaleLowerCase();
  const field = search.closest(".people-field");
  let matches = 0;
  field.querySelectorAll("[data-people-group]").forEach((group) => {
    const groupMatches = group.querySelector(".people-group-title").textContent.toLocaleLowerCase().includes(query);
    let visibleInGroup = 0;
    group.querySelectorAll("[data-people-option]").forEach((option) => {
      option.hidden = !(groupMatches || option.textContent.toLocaleLowerCase().includes(query));
      if (!option.hidden) visibleInGroup += 1;
    });
    group.hidden = visibleInGroup === 0;
    matches += visibleInGroup;
  });
  field.querySelector("[data-people-empty]").hidden = matches !== 0;
});

actionFields.addEventListener("change", (e) => {
  const person = e.target.closest("[data-people-option] input");
  if (person) {
    const field = person.closest(".people-field");
    const count = field.querySelectorAll("[data-people-option] input:checked").length;
    field.querySelector("[data-people-count]").textContent = count ? `${count} selected` : "No one selected";
    return;
  }

  const input = e.target.closest("input[type='file']");
  if (!input) return;
  const label = actionFields.querySelector(`label[for="${input.id}"] .task-upload-text`);
  if (label) label.textContent = input.files[0]?.name || label.dataset.defaultLabel;
});

actionBackdrop.addEventListener("click", (e) => {
  if (e.target === actionBackdrop || e.target.closest("[data-close-action-dialog]")) closeActionDialog();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !actionBackdrop.hidden) closeActionDialog();
});

const detailList = (pairs) => `<dl class="action-detail-list">${pairs
  .filter(([, value]) => value)
  .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;

/* SHARED HELPERS */
function dueInfo(dateValue) {
  if (!dateValue) return { due: "", label: "Not set", cls: "due-date" };
  const [year, month, day] = dateValue.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const difference = Math.round((date - today) / 86400000);
  if (difference < 0) return { due: "overdue", label: "Overdue", cls: "overdue" };
  if (difference === 0) return { due: "today", label: "Due Today", cls: "due-today" };
  if (difference === 1) return { due: "tomorrow", label: "Due Tomorrow", cls: "due-tomorrow" };
  const label = date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return { due: difference <= 7 ? "week" : "", label, cls: "due-date" };
}

const toDateInput = (date) => formatDateInput(date);
const initialsOf = (name) => name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const firstName = (name) => name.split(/\s+/)[0] || name;
const rowTitle = (row) => row.querySelector("strong")?.textContent.trim() || "this item";

// Swap a button's text while keeping its icon
function setButtonLabel(button, label) {
  const textNode = Array.from(button.childNodes).reverse().find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
  if (textNode) textNode.textContent = label;
  else button.append(label);
}

function downloadText(filename, text, type = "text/csv") {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type }));
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

const toCsv = (rows) => rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");

/* ROW ACTIONS: Remind / Respond / View */
function openRemindDialog(row, button) {
  const title = rowTitle(row);
  const waitingOn = row.querySelector(".waiting-tag")?.textContent.replace(/^[\s\S]*Waiting on\s*/i, "").trim();
  const recipient = waitingOn || row.dataset.recipient || (row.matches("[data-task-row]") ? row.cells[6].textContent.trim() : "");
  const due = rowDueStatus(row)?.textContent.trim() || "";
  const duePhrase = /overdue|due today|due tomorrow/i.test(due) ? ` — it's ${due.toLowerCase()}` : due ? ` — it's due ${due}` : "";

  openActionDialog({
    title: "Send reminder",
    subtitle: title,
    fields: [
      { type: "row", fields: [
        { name: "to", label: "To", value: recipient, required: true, placeholder: "Person or team" },
        { name: "channel", label: "Send via", type: "select", options: ["Email", "Teams message", "In-app notification"] }
      ] },
      { name: "message", label: "Message", type: "textarea", required: true,
        value: `Hi ${recipient ? firstName(recipient) : "there"}, a quick nudge on "${title}"${duePhrase}. Could you share an update?` }
    ],
    submitLabel: "Send Reminder",
    onSubmit(values) {
      setButtonLabel(button, "Reminded");
      button.setAttribute("aria-label", `Reminder sent for ${title}`);
      if (row.matches("[data-task-row]")) addTaskActivity(row, `Reminder sent to ${values.to}`);
      showToast(`Reminder sent to ${values.to} by ${values.channel.toLowerCase()}.`);
    }
  });
}

function closeRfi(row) {
  if (row.dataset.rfiIndex !== undefined) {
    rfiData[Number(row.dataset.rfiIndex)].status = "completed";
    renderRfis();
    return;
  }

  if (row.matches("[data-oi-row]")) {
    const item = openItemsConfig.rfis.rows[Number(row.dataset.oiIndex)];
    item.group = "completed";
    item.action = "View";
    buildOpenItemsPanel("rfis");
    return;
  }

  // Dashboard list only shows pending RFIs
  row.remove();
  const remaining = document.querySelectorAll("#rfiTable tbody tr").length;
  document.getElementById("dashboard-rfi-count").textContent = `${remaining} Pending`;
}

function openRespondDialog(row, button) {
  const id = row.cells[0].textContent.trim();
  openActionDialog({
    title: `Respond to ${id}`,
    subtitle: rowTitle(row),
    fields: [
      { name: "response", label: "Response", type: "textarea", required: true, placeholder: "Clarification, design intent, or the revised drawing reference..." },
      { type: "row", fields: [
        { name: "impact", label: "Impact", type: "select", options: ["None", "Cost", "Time", "Cost & Time"] },
        { name: "attachment", label: "Attachment", type: "file" }
      ] },
      { name: "close", label: "Close this RFI after responding", type: "checkbox", value: true }
    ],
    submitLabel: "Send Response",
    onSubmit(values) {
      if (values.close) closeRfi(row);
      else setButtonLabel(button, "Responded");
      showToast(values.close ? `${id} answered and closed.` : `Response sent on ${id}.`);
    }
  });
}

document.addEventListener("click", (e) => {
  const button = e.target.closest("[data-row-action]");
  if (!button) return;
  const row = button.closest("tr");
  const action = button.dataset.rowAction;
  if (action === "remind") openRemindDialog(row, button);
  else if (action === "respond") openRespondDialog(row, button);
  else if (action === "view" || action === "open") openRecordForRow(row);
});

/* DASHBOARD + OPEN ITEMS: new tasks */
function nextTaskId(ids) {
  return `T-${Math.max(17, ...ids.map((id) => Number(String(id).replace(/\D/g, "")) || 0)) + 1}`;
}

function addDashboardTask(task) {
  const due = dueInfo(task.targetDate);
  const priority = task.priority.toLowerCase();
  const row = document.createElement("tr");
  row.dataset.taskStatus = "Not Started";
  row.dataset.priority = priority;
  row.dataset.targetDate = task.targetDate;
  row.dataset.description = task.description;
  row.dataset.discipline = task.discipline;
  row.innerHTML = `
    <td><label class="custom-checkbox"><input class="task-checkbox" type="checkbox" aria-label="Complete ${escapeHtml(task.title)}"><span class="checkbox-box"></span></label></td>
    <td>${nextTaskId(Array.from(dashboardTasksBody.rows, (r) => r.cells[1].textContent))}</td>
    <td><strong>${escapeHtml(task.title)}</strong><span class="badge ${priority}">${escapeHtml(task.priority)}</span><span class="row-subtitle">${escapeHtml(task.discipline)}</span></td>
    <td class="cell-project">General</td>
    <td><span class="task-state not-started">Not Started</span></td>
    <td><span class="status ${due.cls}">${due.label}</span></td>
    <td>${escapeHtml(profileState.name)}</td>
    <td><button class="comment-btn" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>Comment</button></td>`;
  dashboardTasksBody.prepend(row);
  updateTaskCount();
}

function addOpenItemsTask(task) {
  const due = dueInfo(task.targetDate);
  const rows = openItemsConfig.tasks.rows;
  rows.unshift({
    id: nextTaskId(rows.map((r) => r.id)),
    title: escapeHtml(task.title),
    sub: escapeHtml(task.discipline),
    priority: task.priority,
    due: due.due,
    dueLabel: due.label,
    wing: "Wing 25",
    by: escapeHtml(profileState.name),
    group: "todo",
    action: "Comment"
  });
  buildOpenItemsPanel("tasks");
}

/* DASHBOARD DELIVERABLES: new rows */
function addDashboardDeliverable(values) {
  const due = dueInfo(values.due);
  const priority = values.priority.toLowerCase();
  const row = document.createElement("tr");
  row.innerHTML = `
    <td><label class="custom-checkbox"><input class="task-checkbox" type="checkbox" aria-label="Complete ${escapeHtml(values.title)}"><span class="checkbox-box"></span></label></td>
    <td><strong>${escapeHtml(values.title)}</strong><span class="badge ${priority}">${escapeHtml(values.priority)}</span></td>
    <td>${escapeHtml(values.project)}</td>
    <td><span class="task-state not-started">Not Started</span></td>
    <td><span class="status ${due.cls}">${due.label}</span></td>
    <td></td>`;
  deliverablesBody.prepend(row);
  updateDeliverablesCount();
}

/* PROJECT DELIVERABLES: design deliverable tracker */
const daysFromNow = (days) => toDateInput(new Date(Date.now() + days * 86400000));
const trackerStatuses = ["Not Started", "In Progress", "In Review", "Submitted", "Approved", "On Hold"];
const deliverableStateClass = {
  "Not Started": "not-started", "In Progress": "in-progress", "In Review": "in-review", Submitted: "in-review",
  Approved: "completed", Completed: "completed", "On Hold": "on-hold", Delayed: "delayed", Pending: "pending"
};
const trackerStages = ["Concept", "Schematic Design", "Design Development", "Tender", "GFC", "VFC", "As-built"];
const trackerDepartments = ["Electrical", "Plumbing", "HVAC", "Fire Fighting", "ELV", "Coordinated"];
const trackerTowers = ["Tower 16", "Tower 26", "MLCP", "UGT 2"];
const trackerFloors = ["Basement 2", "Basement 1", "Ground", "Podium", "L1–L10", "L11–L20", "Terrace", "All floors"];
const trackerDimensions = { tower: "Tower", stage: "Stage", department: "Department", floor: "Floor" };

let deliverableTracker = [
  { docNo: "LB-EL-T26-101", title: "Electrical lighting layout Rev C", tower: "Tower 26", floor: "L1–L10", stage: "GFC", department: "Electrical", due: daysFromNow(0), status: "In Progress", owner: "Fatima Khan" },
  { docNo: "LB-EL-T26-102", title: "Small power & DB schedule", tower: "Tower 26", floor: "L11–L20", stage: "GFC", department: "Electrical", due: daysFromNow(9), status: "Not Started", owner: "Fatima Khan" },
  { docNo: "LB-FF-T26-201", title: "Fire tender package", tower: "Tower 26", floor: "All floors", stage: "Tender", department: "Fire Fighting", due: daysFromNow(-3), status: "In Progress", owner: "Apurva Bhadange", waiting: "MEP Consultant" },
  { docNo: "LB-HV-T26-301", title: "Typical floor ventilation layout", tower: "Tower 26", floor: "L1–L10", stage: "Design Development", department: "HVAC", due: daysFromNow(12), status: "In Review", owner: "Neha Kapoor" },
  { docNo: "LB-PH-T16-110", title: "Drainage calculations", tower: "Tower 16", floor: "L1–L10", stage: "Design Development", department: "Plumbing", due: daysFromNow(1), status: "Not Started", owner: "Riya Shah" },
  { docNo: "LB-PH-T16-111", title: "Plumbing single line diagram R3", tower: "Tower 16", floor: "All floors", stage: "Design Development", department: "Plumbing", due: daysFromNow(6), status: "Submitted", owner: "Riya Shah" },
  { docNo: "LB-EL-T16-120", title: "Terrace lightning protection layout", tower: "Tower 16", floor: "Terrace", stage: "Schematic Design", department: "Electrical", due: daysFromNow(-12), status: "Approved", owner: "Fatima Khan" },
  { docNo: "LB-HV-MLCP-301", title: "HVAC equipment schedule — chillers", tower: "MLCP", floor: "Basement 2", stage: "Design Development", department: "HVAC", due: daysFromNow(4), status: "Not Started", owner: "Neha Kapoor", waiting: "Architect" },
  { docNo: "LB-HV-MLCP-302", title: "Basement jet fan layout", tower: "MLCP", floor: "Basement 1", stage: "GFC", department: "HVAC", due: daysFromNow(-20), status: "Approved", owner: "Neha Kapoor" },
  { docNo: "LB-FF-MLCP-210", title: "Sprinkler layout — parking levels", tower: "MLCP", floor: "Basement 1", stage: "Tender", department: "Fire Fighting", due: daysFromNow(15), status: "In Progress", owner: "Apurva Bhadange" },
  { docNo: "LB-FF-UGT2-220", title: "Fire pump room layout", tower: "UGT 2", floor: "Basement 2", stage: "VFC", department: "Fire Fighting", due: daysFromNow(-30), status: "Approved", owner: "Apurva Bhadange" },
  { docNo: "LB-CO-ALL-001", title: "Concept MEP design report", tower: "All Towers", floor: "All floors", stage: "Concept", department: "Coordinated", due: daysFromNow(-60), status: "Approved", owner: "Apurva Bhadange" },
  { docNo: "LB-ELV-T26-401", title: "Access control & CCTV riser", tower: "Tower 26", floor: "Ground", stage: "Schematic Design", department: "ELV", due: daysFromNow(20), status: "On Hold", owner: "Fatima Khan" }
];
let trackerSource = "Sample tracker";
let trackerGroupBy = "tower";
const trackerFilters = { tower: "all", stage: "all", department: "all", floor: "all", status: "all" };
const collapsedTrackerGroups = new Set();
const trackerSearch = document.getElementById("tracker-search");

// Basements first, then ground, podium, numbered levels, terrace
function floorRank(floor) {
  const value = floor.toLowerCase();
  const number = Number((value.match(/\d+/) || [0])[0]);
  if (/basement|^b\d/.test(value)) return -100 - number;
  if (/ground|^g$|^gf/.test(value)) return 0;
  if (/podium|stilt|plinth/.test(value)) return 1;
  if (/terrace|roof|ohwt/.test(value)) return 1000;
  if (/all|typical/.test(value) && !/\d/.test(value)) return 2000;
  if (/\d/.test(value)) return 10 + number;
  return 1500;
}

const stageRank = (stage) => {
  const index = trackerStages.findIndex((s) => s.toLowerCase() === stage.toLowerCase());
  return index === -1 ? 100 : index;
};

function trackerGroupSort(dimension) {
  if (dimension === "floor") return (a, b) => floorRank(a) - floorRank(b) || a.localeCompare(b);
  if (dimension === "stage") return (a, b) => stageRank(a) - stageRank(b) || a.localeCompare(b);
  return (a, b) => a.localeCompare(b, undefined, { numeric: true });
}

const trackerDue = (item) => (item.status === "Approved" ? { label: "—", cls: "due-date", due: "" } : dueInfo(item.due));

function trackerMatches(item) {
  const query = trackerSearch.value.trim().toLocaleLowerCase();
  return Object.entries(trackerFilters).every(([key, value]) => value === "all" || item[key] === value)
    && `${item.docNo} ${item.title} ${item.owner || ""} ${item.tower} ${item.floor} ${item.stage} ${item.department}`.toLocaleLowerCase().includes(query);
}

function renderTrackerFilters() {
  const keys = ["tower", "floor", "stage", "department", "status"];
  const labels = { ...trackerDimensions, status: "Status" };
  document.getElementById("tracker-filters").innerHTML = keys.map((key) => {
    const values = [...new Set(deliverableTracker.map((item) => item[key]))].sort(key === "status" ? undefined : trackerGroupSort(key));
    if (trackerFilters[key] !== "all" && !values.includes(trackerFilters[key])) trackerFilters[key] = "all";
    return `
      <div class="tracker-filter">
        <label for="tracker-filter-${key}">${labels[key]}</label>
        <select id="tracker-filter-${key}" data-tracker-filter="${key}">
          <option value="all">All</option>
          ${values.map((value) => `<option${trackerFilters[key] === value ? " selected" : ""}>${escapeHtml(value)}</option>`).join("")}
        </select>
      </div>`;
  }).join("") + '<button class="clear-team-selection tracker-clear" type="button" data-tracker-clear-filters>Clear filters</button>';

  const active = Object.values(trackerFilters).filter((value) => value !== "all").length;
  const badge = document.getElementById("tracker-filter-count");
  badge.textContent = active;
  badge.hidden = active === 0;
}

function renderTracker() {
  const columns = [
    ["docNo", "Doc No."], ["title", "Deliverable"], ["tower", "Tower"], ["floor", "Floor"],
    ["stage", "Stage"], ["department", "Department"], ["due", "Due Date"], ["status", "Status"]
  ].filter(([key]) => key !== trackerGroupBy); // the grouped column would repeat the group header

  document.getElementById("tracker-head").innerHTML = `<tr>${columns.map(([, label]) => `<th scope="col">${label}</th>`).join("")}</tr>`;

  const visible = deliverableTracker.map((item, index) => ({ item, index })).filter(({ item }) => trackerMatches(item));
  const groups = new Map();
  visible.forEach((entry) => {
    const key = entry.item[trackerGroupBy] || "Unassigned";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  });

  const cell = (item, key) => {
    if (key === "title") {
      const parts = [item.owner ? escapeHtml(item.owner) : "", item.waiting ? `<span class="waiting-tag">Waiting on ${escapeHtml(item.waiting)}</span>` : ""].filter(Boolean);
      return `<strong>${escapeHtml(item.title)}</strong>${parts.length ? `<span class="row-subtitle">${parts.join(" · ")}</span>` : ""}`;
    }
    if (key === "due") {
      const due = trackerDue(item);
      return `<span class="status ${due.cls}">${due.label}</span>`;
    }
    if (key === "status") return `<span class="task-state ${deliverableStateClass[item.status] || "pending"}">${escapeHtml(item.status)}</span>`;
    return escapeHtml(item[key] || "—");
  };

  const sortedKeys = [...groups.keys()].sort(trackerGroupSort(trackerGroupBy));
  document.getElementById("tracker-list").innerHTML = sortedKeys.map((key) => {
    const entries = groups.get(key);
    const approved = entries.filter(({ item }) => item.status === "Approved").length;
    const overdue = entries.filter(({ item }) => trackerDue(item).due === "overdue").length;
    const open = !collapsedTrackerGroups.has(`${trackerGroupBy}:${key}`);
    return `
      <tr class="project-task-group-row"><th colspan="${columns.length}">
        <button class="task-group-toggle" type="button" data-tracker-toggle="${escapeHtml(key)}" aria-expanded="${open}">
          <span class="task-group-chevron" aria-hidden="true"></span>
          <span>${escapeHtml(key)}</span>
          <span class="task-group-count">${String(entries.length).padStart(2, "0")}</span>
          <span class="tracker-group-meta">
            ${overdue ? `<span class="status overdue">${overdue} overdue</span>` : ""}
            <span class="report-meter" aria-hidden="true"><span style="width:${Math.round((approved / entries.length) * 100)}%"></span></span>
            ${approved}/${entries.length} approved
          </span>
        </button>
      </th></tr>
      ${open ? entries.map(({ item, index }) => `
        <tr class="project-task-row tracker-row${item.status === "Approved" ? " is-approved" : ""}" data-tracker-index="${index}" tabindex="0">
          ${columns.map(([colKey]) => `<td>${cell(item, colKey)}</td>`).join("")}
        </tr>`).join("") : ""}`;
  }).join("");

  document.getElementById("tracker-empty").hidden = visible.length !== 0;

  const approvedTotal = deliverableTracker.filter((item) => item.status === "Approved").length;
  const overdueTotal = deliverableTracker.filter((item) => trackerDue(item).due === "overdue").length;
  document.getElementById("tracker-summary").innerHTML = `
    <span><strong>${deliverableTracker.length}</strong> deliverables</span>
    <span><strong>${approvedTotal}</strong> approved</span>
    <span class="${overdueTotal ? "waiting-tag" : ""}"><strong>${overdueTotal}</strong> overdue</span>
    <span>${new Set(deliverableTracker.map((item) => item.tower)).size} towers · ${new Set(deliverableTracker.map((item) => item.floor)).size} floors · ${new Set(deliverableTracker.map((item) => item.stage)).size} stages · ${new Set(deliverableTracker.map((item) => item.department)).size} departments</span>
    <span class="tracker-source">Source: ${escapeHtml(trackerSource)}</span>`;

  renderTrackerFilters();
  renderOverviewDisciplines();
}

// The overview's "Deliverables by discipline" panel and header metric come from the tracker
const disciplineIcons = { Electrical: "ϟ", HVAC: "⌁", Mechanical: "⌁", Plumbing: "♨", "Fire Fighting": "♨", ELV: "◈", Coordinated: "◎" };

function renderOverviewDisciplines() {
  const departments = new Map();
  deliverableTracker.forEach((item) => {
    const entry = departments.get(item.department) || { done: 0, total: 0 };
    entry.total += 1;
    if (item.status === "Approved") entry.done += 1;
    departments.set(item.department, entry);
  });

  document.getElementById("overview-discipline-list").innerHTML = [...departments.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 5)
    .map(([name, { done, total }]) => `
      <div class="discipline-item">
        <span class="discipline-icon">${disciplineIcons[name] || "◇"}</span><span class="discipline-name">${escapeHtml(name)}</span>
        <span class="discipline-progress" role="img" aria-label="${done} of ${total} approved"><span style="width:${Math.round((done / total) * 100)}%"></span></span><span class="discipline-total"><strong>${done}</strong> /${total}</span>
      </div>`).join("");

  const approved = deliverableTracker.filter((item) => item.status === "Approved").length;
  document.getElementById("overview-discipline-count").textContent = `${approved}/${deliverableTracker.length} approved`;
  document.getElementById("metric-deliverables").textContent = deliverableTracker.length;
  document.getElementById("metric-deliverables-overdue").textContent = deliverableTracker.filter((item) => trackerDue(item).due === "overdue").length;
}

document.querySelectorAll("[data-tracker-group]").forEach((chip) => {
  chip.addEventListener("click", () => {
    trackerGroupBy = chip.dataset.trackerGroup;
    document.querySelectorAll("[data-tracker-group]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderTracker();
  });
});

trackerSearch.addEventListener("input", renderTracker);

document.getElementById("tracker-filter-btn").addEventListener("click", (e) => {
  const button = e.currentTarget;
  const expanded = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!expanded));
  document.getElementById("tracker-filters").hidden = expanded;
});

document.getElementById("tracker-filters").addEventListener("change", (e) => {
  const select = e.target.closest("[data-tracker-filter]");
  if (!select) return;
  trackerFilters[select.dataset.trackerFilter] = select.value;
  renderTracker();
});

document.getElementById("tracker-filters").addEventListener("click", (e) => {
  if (!e.target.closest("[data-tracker-clear-filters]")) return;
  Object.keys(trackerFilters).forEach((key) => { trackerFilters[key] = "all"; });
  renderTracker();
});

document.getElementById("tracker-list").addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-tracker-toggle]");
  if (!toggle) return;
  const key = `${trackerGroupBy}:${toggle.dataset.trackerToggle}`;
  if (collapsedTrackerGroups.has(key)) collapsedTrackerGroups.delete(key);
  else collapsedTrackerGroups.add(key);
  renderTracker();
});

/* TRACKER IMPORT (Excel / CSV) */
// Header names people commonly use for each tracker column
const trackerColumnAliases = {
  docNo: ["doc no", "document no", "document number", "drawing no", "drawing number", "dwg no", "sheet no", "ref no", "reference no", "doc id", "number"],
  title: ["document", "document name", "document title", "drawing", "drawing name", "drawing title", "deliverable", "deliverable name", "title", "description", "name"],
  tower: ["tower", "wing", "building", "block", "tower wing"],
  floor: ["floor", "level", "storey", "floor level", "floors"],
  stage: ["stage", "design stage", "phase", "submission stage"],
  department: ["department", "dept", "discipline", "service", "services", "trade"],
  due: ["due", "due date", "target date", "planned date", "submission date", "target", "planned submission"],
  status: ["status", "current status", "state"],
  owner: ["owner", "responsible", "assigned to", "prepared by", "in charge"]
};
const trackerFieldLabels = { docNo: "Doc No.", title: "Document", tower: "Tower", floor: "Floor", stage: "Stage", department: "Department", due: "Due date", status: "Status", owner: "Owner" };
const normalizeHeader = (header) => String(header ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function matchTrackerColumns(headerRow) {
  const headers = headerRow.map(normalizeHeader);
  const mapping = {};
  const used = new Set();
  // Exact header matches first, then headers that contain a known name ("Drawing Title (Rev)")
  [(header, alias) => header === alias, (header, alias) => alias.length > 3 && header.includes(alias)].forEach((test) => {
    Object.entries(trackerColumnAliases).forEach(([field, aliases]) => {
      if (mapping[field] !== undefined) return;
      const index = headers.findIndex((header, i) => header && !used.has(i) && aliases.some((alias) => test(header, alias)));
      if (index !== -1) {
        mapping[field] = index;
        used.add(index);
      }
    });
  });
  const unmatched = headerRow.filter((header, i) => String(header).trim() && !used.has(i)).map(String);
  return { mapping, unmatched };
}

function parseCsv(text) {
  const firstLine = text.split(/\r?\n/, 1)[0];
  const delimiter = [",", ";", "\t"].sort((a, b) => firstLine.split(b).length - firstLine.split(a).length)[0];
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') { value += '"'; i += 1; }
      else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') {
      quoted = true;
    } else if (char === delimiter) {
      row.push(value);
      value = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  if (value || row.length) rows.push([...row, value]);
  return rows;
}

let sheetJsPromise = null;
function loadSheetJs() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  sheetJsPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = () => {
      sheetJsPromise = null;
      script.remove();
      reject(new Error("Couldn't load the Excel reader. Check your connection, or save the sheet as CSV and import that."));
    };
    document.head.append(script);
  });
  return sheetJsPromise;
}

async function readTrackerRows(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (extension === "csv" || extension === "txt") return parseCsv(await file.text());
  if (extension === "xlsx" || extension === "xls") {
    const XLSX = await loadSheetJs();
    const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: false });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { header: 1, raw: true, defval: "" });
  }
  throw new Error("Use an .xlsx, .xls or .csv file.");
}

function parseTrackerDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return toDateInput(value);
  if (typeof value === "number" && value > 20000 && value < 80000) {
    // Excel stores dates as day counts; read them as UTC so the local timezone cannot shift the day
    const date = new Date(Math.round(value - 25569) * 86400000);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  }
  const text = String(value ?? "").trim();
  if (!text) return "";
  let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) return toDateInput(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/); // day-first, as used on Indian sites
  if (match) {
    const year = Number(match[3].length === 2 ? `20${match[3]}` : match[3]);
    return toDateInput(new Date(year, Number(match[2]) - 1, Number(match[1])));
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? "" : toDateInput(parsed);
}

function normalizeTrackerStatus(value) {
  const text = String(value ?? "").toLowerCase();
  if (!text.trim()) return "Not Started";
  if (/not\s*started|yet to|pending|to do|todo/.test(text)) return "Not Started";
  if (/approv|complete|done|closed|issued for construction|accepted/.test(text)) return "Approved";
  if (/review|comment/.test(text)) return "In Review";
  if (/submit|issued/.test(text)) return "Submitted";
  if (/hold/.test(text)) return "On Hold";
  if (/progress|wip|ongoing|started|drafting/.test(text)) return "In Progress";
  return "Not Started";
}

function normalizeStage(value) {
  const text = String(value ?? "").trim();
  const key = text.toLowerCase().replace(/[^a-z]/g, "");
  const known = { sd: "Schematic Design", schematic: "Schematic Design", schematicdesign: "Schematic Design", dd: "Design Development", designdevelopment: "Design Development", gfc: "GFC", vfc: "VFC", tender: "Tender", concept: "Concept", conceptdesign: "Concept", asbuilt: "As-built" };
  return known[key] || text || "Unassigned";
}

function normalizeDepartment(value) {
  const text = String(value ?? "").trim();
  const key = text.toLowerCase().replace(/[^a-z]/g, "");
  const known = { el: "Electrical", ele: "Electrical", elec: "Electrical", electrical: "Electrical", ph: "Plumbing", phe: "Plumbing", plb: "Plumbing", plumbing: "Plumbing", hvac: "HVAC", mech: "HVAC", mechanical: "HVAC", ff: "Fire Fighting", fire: "Fire Fighting", fps: "Fire Fighting", firefighting: "Fire Fighting", elv: "ELV", coordinated: "Coordinated", coord: "Coordinated" };
  return known[key] || text || "Unassigned";
}

function trackerItemsFromRows(rows) {
  // The header may sit below a title block ("Project X - MEP Deliverables"), so take the row
  // in the first 10 that matches the most column names and includes a document column
  let headerIndex = -1;
  let bestScore = 0;
  rows.slice(0, 10).forEach((row, index) => {
    const { mapping } = matchTrackerColumns(row);
    const score = Object.keys(mapping).length;
    if (mapping.title !== undefined && score > bestScore) {
      headerIndex = index;
      bestScore = score;
    }
  });
  if (headerIndex === -1) {
    throw new Error("Couldn't find a document name column. Add a header such as \"Document Name\" or \"Drawing Title\" — or start from the template.");
  }
  const { mapping, unmatched } = matchTrackerColumns(rows[headerIndex]);
  const get = (row, field) => (mapping[field] === undefined ? "" : row[mapping[field]]);
  const items = [];
  let skipped = 0;

  rows.slice(headerIndex + 1).forEach((row) => {
    if (!row.some((value) => String(value).trim())) return; // blank line
    const title = String(get(row, "title")).trim();
    if (!title) {
      skipped += 1;
      return;
    }
    items.push({
      docNo: String(get(row, "docNo")).trim() || `IMP-${String(items.length + 1).padStart(3, "0")}`,
      title,
      tower: String(get(row, "tower")).trim() || "Unassigned",
      floor: String(get(row, "floor")).trim() || "Unassigned",
      stage: normalizeStage(get(row, "stage")),
      department: normalizeDepartment(get(row, "department")),
      due: parseTrackerDate(get(row, "due")),
      status: normalizeTrackerStatus(get(row, "status")),
      owner: String(get(row, "owner")).trim()
    });
  });

  return { items, skipped, matched: Object.keys(mapping).map((field) => trackerFieldLabels[field]), unmatched };
}

async function importTrackerFile(file, replace) {
  try {
    actionSubmit.disabled = true;
    actionSubmit.textContent = "Reading file…";
    const { items, skipped, matched, unmatched } = trackerItemsFromRows(await readTrackerRows(file));
    if (!items.length) throw new Error("The file has a header row but no deliverables under it.");

    deliverableTracker = replace ? items : [...deliverableTracker, ...items];
    trackerSource = `${file.name} · imported ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
    Object.keys(trackerFilters).forEach((key) => { trackerFilters[key] = "all"; });
    collapsedTrackerGroups.clear();
    renderTracker();
    prependActivity({ initials: initialsOf(profileState.name), text: `${initialsOf(profileState.name)} imported <b>${items.length} deliverables</b> from ${escapeHtml(file.name)}`, tag: "Tracker" });
    closeActionDialog();

    const count = (key) => new Set(items.map((item) => item[key])).size;
    openActionDialog({
      title: `Imported ${items.length} deliverable${items.length === 1 ? "" : "s"}`,
      subtitle: file.name,
      body: detailList([
        ["Towers", String(count("tower"))],
        ["Floors", String(count("floor"))],
        ["Stages", String(count("stage"))],
        ["Departments", String(count("department"))],
        ["Columns read", matched.join(", ")],
        ["Columns ignored", unmatched.join(", ")],
        ["Rows skipped", skipped ? `${skipped} without a document name` : ""]
      ]),
      submitLabel: null,
      cancelLabel: "View tracker"
    });
  } catch (error) {
    setActionError(error.message);
  } finally {
    actionSubmit.disabled = false;
    if (actionConfig) actionSubmit.textContent = actionConfig.submitLabel || "Save";
  }
}

const trackerTemplate = [
  ["Doc No", "Document Name", "Tower", "Floor", "Stage", "Department", "Due Date", "Status", "Owner"],
  ["LB-EL-T26-101", "Electrical lighting layout", "Tower 26", "L1–L10", "GFC", "Electrical", daysFromNow(14), "In Progress", "Fatima Khan"],
  ["LB-PH-T16-110", "Drainage calculations", "Tower 16", "Basement 1", "DD", "Plumbing", daysFromNow(21), "Not Started", "Riya Shah"],
  ["LB-FF-UGT2-220", "Fire pump room layout", "UGT 2", "Basement 2", "VFC", "Fire Fighting", daysFromNow(-5), "Approved", "Apurva Bhadange"]
];

function openTrackerImportDialog() {
  openActionDialog({
    title: "Import deliverable tracker",
    subtitle: overviewPage.querySelector(".project-title").textContent,
    body: `
      <p class="action-dialog-text">Upload the design deliverable list as Excel or CSV. Columns are matched by their header: a <b>Document / Drawing name</b> column is required; Doc No., Tower, Floor, Stage, Department, Due date, Status and Owner are read when present.</p>
      <button class="comment-btn tracker-template-btn" type="button" data-tracker-template>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        Download CSV template
      </button>`,
    fields: [
      { name: "file", label: "Tracker file (.xlsx, .xls, .csv)", type: "file", accept: ".xlsx,.xls,.csv" },
      { name: "mode", label: "Import as", type: "select", options: ["Replace the current tracker", "Add to the current tracker"] }
    ],
    submitLabel: "Import",
    onSubmit(values) {
      if (!values.file) {
        setActionError("Choose a file to import.");
        return false;
      }
      importTrackerFile(values.file, values.mode.startsWith("Replace"));
      return false; // the import closes the dialog once the file is read
    }
  });
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-tracker-import]")) openTrackerImportDialog();
  if (e.target.closest("[data-tracker-template]")) downloadText("deliverable-tracker-template.csv", toCsv(trackerTemplate));
});

/* PROJECT TRANSMITTALS
   IFC uploads in Files draft a transmittal automatically; nothing is sent until someone reviews it. */
const transmittalWings = ["Wing 25", "Wing 32", "Signet B", "Tower 16", "Tower 26", "MLCP", "UGT 2"];
const transmittalSources = ["DSG", "Urja", "Verdant Systems", "In-house"];
const transmittalPurposes = ["For construction", "For approval", "For information", "For tender"];
const transmittals = [
  {
    no: "TR-235", wing: "Wing 25", source: "DSG", recipient: "Pravin Kolapte", recipientRole: "Site Manager", purpose: "For construction",
    copies: { color: 1, bw: 6 }, status: "pending", sent: null, created: daysFromNow(-1), origin: "ifc", by: "Apurva Bhadange", remarks: "",
    drawings: [
      { no: "LB-PH-W25-110", name: "Plumbing single line diagram", rev: "R3" },
      { no: "LB-PH-W25-111", name: "Toilet plumbing details — typical", rev: "R1" },
      { no: "LB-FF-W25-201", name: "Sprinkler layout — typical floor", rev: "R2" },
      { no: "LB-EL-W25-101", name: "Electrical lighting layout", rev: "Rev C" }
    ]
  },
  {
    no: "TR-236", wing: "Signet B", source: "Urja", recipient: "Pravin Kolapte", recipientRole: "Site Manager", purpose: "For construction",
    copies: { color: 1, bw: 6 }, status: "pending", sent: null, created: daysFromNow(-1), origin: "ifc", by: "Apurva Bhadange", remarks: "",
    drawings: [
      { no: "SG-HV-B-301", name: "Ventilation layout — basement 1", rev: "R1" },
      { no: "SG-HV-B-302", name: "Ventilation layout — basement 2", rev: "R1" },
      { no: "SG-EL-B-120", name: "LT panel room layout", rev: "R0" },
      { no: "SG-EL-B-121", name: "Cable tray routing — podium", rev: "R2" },
      { no: "SG-FF-B-210", name: "Fire pump room layout", rev: "R4" },
      { no: "SG-PH-B-112", name: "Drainage layout — podium", rev: "R1" }
    ]
  },
  {
    no: "TR-237", wing: "Wing 32", source: "DSG", recipient: "Pravin Kolapte", recipientRole: "Site Manager", purpose: "For construction",
    copies: { color: 1, bw: 6 }, status: "sent", sent: "2026-10-07", created: "2026-10-06", origin: "ifc", by: "Apurva Bhadange", remarks: "",
    drawings: [
      { no: "LB-EL-W32-101", name: "Electrical lighting layout", rev: "R2" },
      { no: "LB-FF-W32-201", name: "Fire tender layout", rev: "R1" }
    ]
  }
];
let transmittalFilter = "all";
const transmittalSearch = document.getElementById("transmittal-search");

const transmittalsSentNewestFirst = () => transmittals.filter((t) => t.status === "sent" && t.recipient).sort((a, b) => b.sent.localeCompare(a.sent));

// Recipient, source and copies come from what was last sent for the same wing,
// then from what is sent most often; with no history the user fills them in
function transmittalDefaults(wing) {
  const sent = transmittalsSentNewestFirst();
  const sameWing = sent.find((t) => t.wing === wing);
  const counts = new Map();
  sent.forEach((t) => counts.set(t.recipient, (counts.get(t.recipient) || 0) + 1));
  const mostUsed = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const basis = sameWing || sent.find((t) => t.recipient === mostUsed?.[0]);
  return {
    recipient: basis?.recipient || "",
    recipientRole: basis?.recipientRole || "",
    source: basis?.source || "DSG",
    copies: basis ? { ...basis.copies } : { color: 1, bw: 6 },
    basis
  };
}

const recentRecipients = () => [...new Set(transmittalsSentNewestFirst().map((t) => t.recipient))].slice(0, 4);

function nextTransmittalNo() {
  return `TR-${Math.max(0, ...transmittals.map((t) => Number(t.no.replace(/\D/g, "")) || 0)) + 1}`;
}

// Drawing number, name and revision are read from the file name (and matched against the tracker)
function drawingFromFile(fileName, wing, index) {
  const base = fileName.replace(/\.[^.]+$/, "");
  const revMatch = base.match(/[_\s-](R(?:ev)?)[\s_-]?([A-Z]|\d{1,2})$/i);
  const rev = revMatch ? (/\d/.test(revMatch[2]) ? `R${revMatch[2]}` : `Rev ${revMatch[2].toUpperCase()}`) : "R0";
  const readable = (revMatch ? base.slice(0, revMatch.index) : base).replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  const numberMatch = base.match(/[A-Z]{2,}(?:-[A-Z0-9]+){2,}/);
  const compact = (text) => text.toLowerCase().replace(/[^a-z0-9]/g, "");
  const tracked = deliverableTracker.find((item) => compact(readable).includes(compact(item.title)) || compact(item.title).includes(compact(readable)));
  const wingCode = wing.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return {
    no: numberMatch?.[0] || tracked?.docNo || `${wingCode}-DWG-${String(index + 1).padStart(3, "0")}`,
    name: tracked?.title || readable.replace(numberMatch?.[0] || "", "").trim() || base,
    rev
  };
}

function draftTransmittalFromIfc(files, wing) {
  const defaults = transmittalDefaults(wing);
  const transmittal = {
    no: nextTransmittalNo(),
    wing,
    source: defaults.source,
    recipient: defaults.recipient,
    recipientRole: defaults.recipientRole,
    purpose: "For construction",
    copies: defaults.copies,
    status: "pending",
    sent: null,
    created: toDateInput(new Date()),
    origin: "ifc",
    by: profileState.name,
    remarks: "",
    drawings: files.map((file, index) => drawingFromFile(file.name, wing, index)),
    activity: [
      `Drafted automatically from an IFC upload (${files.length} drawing${files.length === 1 ? "" : "s"})`,
      defaults.recipient ? `Recipient filled from history: ${defaults.recipient}` : "Recipient needed before sending"
    ]
  };
  transmittals.push(transmittal);
  renderTransmittals();
  notifications.unshift({
    id: `n-${transmittal.no}`, who: profileState.name, time: "Just now",
    title: `${transmittal.no} drafted for ${wing}`,
    body: `${files.length} IFC drawing${files.length === 1 ? "" : "s"} ready to review and send.`,
    project: overviewPage.querySelector(".project-title").textContent, route: "project/transmittals", unread: true
  });
  renderNotifications();
  return transmittal;
}

const pad2 = (value) => String(value).padStart(2, "0");
const transmittalDate = (iso) => (iso ? formatLongDate(iso).replace(/^(\d+) (\w{3})\w* (\d+)$/, "$1 $2 $3") : "—");
// Table style from the design: "07, Oct, 2026"
const transmittalTableDate = (iso) => transmittalDate(iso).replace(/^(\d+) (\w+) (\d+)$/, "$1, $2, $3");

function renderTransmittals() {
  const query = transmittalSearch.value.trim().toLocaleLowerCase();
  const visible = transmittals
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => (transmittalFilter === "all" || item.status === transmittalFilter)
      && `${item.no} ${item.wing} ${item.source} ${item.recipient} ${item.drawings.map((d) => `${d.no} ${d.name}`).join(" ")}`.toLocaleLowerCase().includes(query))
    .sort((a, b) => a.item.no.localeCompare(b.item.no, undefined, { numeric: true }));

  const sendIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>';
  const eyeIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';

  document.getElementById("transmittal-list").innerHTML = visible.map(({ item, index }) => {
    const sent = item.status === "sent";
    return `
      <tr class="project-task-row transmittal-row${sent ? " is-sent" : ""}" data-transmittal-index="${index}" tabindex="0">
        <td>${item.no}</td>
        <td><strong>${escapeHtml(item.wing)}</strong></td>
        <td><strong>${pad2(item.drawings.length)}</strong></td>
        <td><strong>${pad2(item.copies.color + item.copies.bw)}</strong> <small class="copies-split">(${item.copies.color} Color + ${item.copies.bw} B&amp;W)</small></td>
        <td><strong>${escapeHtml(item.source)}</strong></td>
        <td>${item.recipient ? `<strong>${escapeHtml(item.recipient)}</strong>` : '<span class="waiting-tag">Add recipient</span>'}</td>
        <td><span class="tr-chip ${sent ? "is-sent" : "is-pending"}">${sent ? "Sent" : "Pending"}</span></td>
        <td>${sent ? `<span class="tr-date">${transmittalTableDate(item.sent)}</span>` : '<span class="tr-dash">—</span>'}</td>
        <td class="col-action">${sent
          ? `<button class="comment-btn" type="button" data-row-action="open">${eyeIcon}View</button>`
          : `<button class="comment-btn" type="button" data-row-action="open">${sendIcon}Review &amp; Send</button>`}</td>
      </tr>`;
  }).join("");
  document.getElementById("transmittal-empty").hidden = visible.length !== 0;

  document.getElementById("metric-transmittals").textContent = transmittals.length;
  document.getElementById("metric-transmittals-pending").textContent = transmittals.filter((item) => item.status === "pending").length;
}

document.querySelectorAll("[data-transmittal-status]").forEach((chip) => {
  chip.addEventListener("click", () => {
    transmittalFilter = chip.dataset.transmittalStatus;
    document.querySelectorAll("[data-transmittal-status]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderTransmittals();
  });
});
transmittalSearch.addEventListener("input", renderTransmittals);

/* TRANSMITTAL PDF (built with jsPDF, loaded on first use) */
let jsPdfPromise = null;
function loadJsPdf() {
  if (window.jspdf?.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
  jsPdfPromise ||= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = () => {
      jsPdfPromise = null;
      script.remove();
      reject(new Error("Couldn't load the PDF maker. Check your connection and try again."));
    };
    document.head.append(script);
  });
  return jsPdfPromise;
}

// PDF fonts only cover basic Latin, so swap typographic dashes and dots for plain ones
const pdfText = (text) => String(text ?? "").replace(/[—–]/g, "-").replace(/·/g, "|").replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
const transmittalSubject = (t) => t.subject || `Issue of ${t.drawings.length} drawing${t.drawings.length === 1 ? "" : "s"} for ${t.wing}`;

// What each issuing party is, printed after its name on the form: "DSG (MEP Consultant)"
const sourceRoles = { DSG: "MEP Consultant", Urja: "Electrical Consultant", "Verdant Systems": "MEP Consultant", "In-house": "MEP Design" };
const purposeRemarks = { "For construction": "IFC", "For approval": "APPROVAL", "For information": "INFO", "For tender": "TENDER" };
const drawingRemark = (t, drawing) => drawing.remarks || (t.origin === "ifc" ? "IFC" : purposeRemarks[t.purpose] || "");

// The open project, or the first one when a PDF or document is opened straight from a link
const currentProjectName = () => {
  const title = overviewPage.querySelector(".project-title").textContent;
  return title === "Project name" ? document.querySelector("[data-project-card] h2").textContent : title;
};

// The transmittal form is laid out on a fixed character grid (Courier), like the site office template
async function buildTransmittalPdf(t) {
  const JsPDF = await loadJsPdf();
  const doc = new JsPDF({ unit: "mm", format: "a4" });
  const project = currentProjectName();
  const width = 92; // characters per line: 9 pt Courier is 1.905 mm a character
  const left = 17;
  const lineHeight = 4.6;
  let y = 18;

  const fit = (text, size) => {
    const value = pdfText(text);
    return (value.length > size ? `${value.slice(0, size - 3)}...` : value).padEnd(size);
  };
  const line = (text = "", bold = false) => {
    if (y > 283) {
      doc.addPage();
      y = 18;
    }
    doc.setFont("courier", bold ? "bold" : "normal");
    doc.text(pdfText(text), left, y);
    y += lineHeight;
  };
  const columns = (leftText, rightText, at = 48) => `${fit(leftText, at)}${pdfText(rightText)}`;
  const spread = (leftText, rightText) => `${pdfText(leftText).padEnd(width - pdfText(rightText).length)}${pdfText(rightText)}`;
  const issueDate = new Date(...(t.sent || toDateInput(new Date())).split("-").map((part, i) => Number(part) - (i === 1 ? 1 : 0)));
  const dotted = `${pad2(issueDate.getDate())}.${pad2(issueDate.getMonth() + 1)}.${issueDate.getFullYear()}`;
  const sent = t.status === "sent";
  const copies = `${t.copies.color} CL + ${t.copies.bw} BW`;
  const sourceRole = sourceRoles[t.source];

  doc.setFontSize(9);
  doc.setTextColor(28, 27, 27);
  line("=".repeat(width));
  y += 1;
  line(spread(`${project.toUpperCase()} | TRANSMITTAL FORM`, `TRANSMITTAL No. : ${project.replace(/^lodha\s+/i, "").toUpperCase()} ${t.no.replace(/\D/g, "")}`), true);
  line();
  line("-".repeat(width));
  line(columns("PROJECT DETAILS", "DISTRIBUTION / RECIPIENT"), true);
  line(columns(`Project / Tower : ${t.wing}`, `To         : ${t.recipient || "-"}${t.recipientRole ? ` (${t.recipientRole})` : ""}`));
  line(columns(`Issue Date      : ${dotted}`, `Source     : ${t.source}${sourceRole ? ` (${sourceRole})` : ""}`));
  line("-".repeat(width));
  line();
  if (t.subject) {
    line(`SUBJECT : ${t.subject}`, true);
    line();
  }
  line(`LIST OF DRAWINGS / DOCUMENTS (${t.drawings.length} ITEM${t.drawings.length === 1 ? "" : "S"})`, true);
  line();
  line(`${"SR".padEnd(4)}${"DESCRIPTION".padEnd(36)}${"DRAWING NO.".padEnd(26)}${"REV".padEnd(6)}${"COPIES".padEnd(13)}REMARKS`, true);
  line("-".repeat(width));
  t.drawings.forEach((drawing, index) => {
    line(`${pad2(index + 1).padEnd(4)}${fit(drawing.name, 35)} ${fit(drawing.no, 25)} ${fit(drawing.rev, 5)} ${fit(copies, 12)} ${pdfText(drawingRemark(t, drawing))}`);
  });
  line("-".repeat(width));
  line();
  if (t.remarks) {
    line("REMARKS", true);
    doc.splitTextToSize(pdfText(t.remarks), 172).forEach((part) => line(part));
    line();
  }
  line("AUTHORIZATION & APPROVALS", true);
  line(`Status         : ${sent ? "Approved & Sent" : "Pending Approval (Draft)"}`);
  line(`Generated By   : ${t.origin === "ifc" ? "Auto-System (IFC Batch Upload)" : t.by}`);
  line(columns(`Approved By    : ${sent ? t.approvedBy || t.by : profileState.name}`, `Date: [ ${transmittalDate(t.sent || toDateInput(new Date()))} ]`, 52));
  line("=".repeat(width));
  return doc;
}

async function downloadTransmittalPdf(t) {
  try {
    const doc = await buildTransmittalPdf(t);
    doc.save(`${t.no}_${t.wing.replace(/\s+/g, "-")}.pdf`);
    (t.activity ||= []).push(`PDF downloaded by ${profileState.name}`);
    if (recordCtx?.data === t) rerenderRecordDrawer();
  } catch (error) {
    showToast(error.message);
  }
}

// Edit what goes on the PDF; the changes are saved to the transmittal itself
const pdfRowHtml = (drawing = { no: "", name: "", rev: "R0", remarks: "" }) => `
  <tr data-pdf-row>
    <td class="pdf-sr"></td>
    <td><input data-pdf-key="name" value="${escapeHtml(drawing.name)}" aria-label="Description"></td>
    <td><input data-pdf-key="no" value="${escapeHtml(drawing.no)}" aria-label="Drawing number"></td>
    <td><input data-pdf-key="rev" value="${escapeHtml(drawing.rev)}" aria-label="Revision"></td>
    <td><input data-pdf-key="remarks" value="${escapeHtml(drawing.remarks || "")}" aria-label="Remarks"></td>
    <td><button class="pdf-remove" type="button" data-pdf-remove aria-label="Remove row">×</button></td>
  </tr>`;

function openTransmittalPdfEditor(t) {
  openActionDialog({
    title: `Edit ${t.no} PDF`,
    subtitle: "Changes are saved to the transmittal and used for every PDF download.",
    wide: true,
    body: `
      <div class="doc-viewer">
        <div class="doc-viewer-bar"><span>Transmittal form · ${escapeHtml(t.wing)}</span><span>Click any text to change it</span></div>
        <article class="doc-page pdf-edit">
          <p class="doc-page-kicker">Transmittal form · ${escapeHtml(t.no)}</p>
          <label class="pdf-field pdf-subject"><span>Subject (optional)</span><input data-pdf="subject" value="${escapeHtml(t.subject || "")}" placeholder="Printed above the drawing list"></label>
          <div class="pdf-grid">
            <label class="pdf-field"><span>To</span><input data-pdf="recipient" value="${escapeHtml(t.recipient)}" placeholder="Recipient name"></label>
            <label class="pdf-field"><span>Role</span><input data-pdf="recipientRole" value="${escapeHtml(t.recipientRole || "")}" placeholder="e.g. Site Manager"></label>
            <label class="pdf-field"><span>Source</span><input data-pdf="source" value="${escapeHtml(t.source)}"></label>
            <label class="pdf-field"><span>Purpose</span><input data-pdf="purpose" value="${escapeHtml(t.purpose)}"></label>
            <label class="pdf-field"><span>Colour copies</span><input data-pdf="color" type="number" min="0" value="${t.copies.color}"></label>
            <label class="pdf-field"><span>B&amp;W copies</span><input data-pdf="bw" type="number" min="0" value="${t.copies.bw}"></label>
          </div>
          <table class="doc-page-table pdf-table">
            <thead><tr><th>Sr</th><th>Description</th><th>Drawing No.</th><th>Rev</th><th>Remarks</th><th><span class="visually-hidden">Remove</span></th></tr></thead>
            <tbody>${t.drawings.map((drawing) => pdfRowHtml({ ...drawing, remarks: drawingRemark(t, drawing) })).join("")}</tbody>
          </table>
          <button class="drawer-add-action" type="button" data-pdf-add-row>+ Add drawing row</button>
          <label class="pdf-field"><span>Remarks</span><textarea data-pdf="remarks" placeholder="Printed under the drawing list...">${escapeHtml(t.remarks)}</textarea></label>
        </article>
      </div>`,
    submitLabel: "Save PDF Changes",
    onSubmit() {
      const get = (key) => actionFields.querySelector(`[data-pdf="${key}"]`).value.trim();
      const drawings = Array.from(actionFields.querySelectorAll("[data-pdf-row]"), (tr) => {
        const value = (key) => tr.querySelector(`[data-pdf-key="${key}"]`).value.trim();
        return { no: value("no"), name: value("name"), rev: value("rev") || "R0", remarks: value("remarks") };
      }).filter((drawing) => drawing.name || drawing.no);
      if (!drawings.length) {
        setActionError("Keep at least one drawing on the transmittal.");
        return false;
      }
      Object.assign(t, {
        subject: get("subject"),
        recipient: get("recipient"),
        recipientRole: get("recipientRole"),
        purpose: get("purpose") || t.purpose,
        source: get("source") || t.source,
        remarks: get("remarks"),
        copies: { color: Math.max(0, Number(get("color")) || 0), bw: Math.max(0, Number(get("bw")) || 0) },
        drawings
      });
      (t.activity ||= []).push(`PDF details edited by ${profileState.name}`);
      renderTransmittals();
      if (recordCtx?.data === t) rerenderRecordDrawer();
      refreshTransmittalPreview(t);
      showToast(`${t.no} PDF updated.`);
    }
  });
  numberPdfRows();
}

function numberPdfRows() {
  actionFields.querySelectorAll("[data-pdf-row] .pdf-sr").forEach((cell, index) => { cell.textContent = pad2(index + 1); });
}

actionFields.addEventListener("click", (e) => {
  if (e.target.closest("[data-pdf-add-row]")) {
    const body = actionFields.querySelector(".pdf-table tbody");
    body.insertAdjacentHTML("beforeend", pdfRowHtml());
    numberPdfRows();
    body.lastElementChild.querySelector("input").focus();
  }
  const remove = e.target.closest("[data-pdf-remove]");
  if (remove) {
    remove.closest("tr").remove();
    numberPdfRows();
  }
});

/* PROJECT MENU ACTIONS: Add Deliverable / Create Transmittal / Add Member / Schedule Meeting */
const disciplineOptions = ["Electrical", "Plumbing", "HVAC", "Fire", "Coordinated", "General"];
const consultantOptions = ["Verdant Systems", "Axis Structural", "Studio North", "TerraScope", "CivicLine Advisory"];
const uniqueOptions = (defaults, key) => [...new Set([...defaults, ...deliverableTracker.map((item) => item[key])])].filter((value) => value && value !== "Unassigned");

function openAddDeliverableDialog(target) {
  if (target === "dashboard") {
    openActionDialog({
      title: "Add Deliverable",
      subtitle: "Adds to Project Deliverables on your dashboard",
      fields: [
        { name: "title", label: "Document name", required: true, placeholder: "e.g. Issue Revised Plumbing GFC" },
        { type: "row", fields: [
          { name: "project", label: "Project", type: "select", options: ["Lodha One • Tower B", "Lodha Amara • Wing 25", "Palava • Phase 2", "Lodha Belmondo • Tower 26"] },
          { name: "priority", label: "Priority", type: "select", options: ["High", "Medium", "Low"], value: "Medium" }
        ] },
        { name: "due", label: "Due date", type: "date", required: true, value: daysFromNow(7) }
      ],
      submitLabel: "Add Deliverable",
      onSubmit(values) {
        addDashboardDeliverable(values);
        showToast(`Deliverable "${values.title}" added.`);
      }
    });
    return;
  }

  openActionDialog({
    title: "Add Deliverable",
    subtitle: overviewPage.querySelector(".project-title").textContent,
    fields: [
      { type: "row", fields: [
        { name: "title", label: "Document name", required: true, placeholder: "e.g. Riser shaft layout" },
        { name: "docNo", label: "Doc No.", placeholder: "Optional" }
      ] },
      { type: "row", fields: [
        { name: "tower", label: "Tower", type: "select", options: uniqueOptions(trackerTowers, "tower") },
        { name: "floor", label: "Floor", type: "select", options: uniqueOptions(trackerFloors, "floor").sort(trackerGroupSort("floor")) }
      ] },
      { type: "row", fields: [
        { name: "stage", label: "Stage", type: "select", options: uniqueOptions(trackerStages, "stage").sort(trackerGroupSort("stage")) },
        { name: "department", label: "Department", type: "select", options: uniqueOptions(trackerDepartments, "department") }
      ] },
      { type: "row", fields: [
        { name: "due", label: "Due date", type: "date", required: true, value: daysFromNow(14) },
        { name: "owner", label: "Owner", type: "select", options: teamMembers.filter((member) => member.group === "mep").map((member) => member.name), value: profileState.name }
      ] }
    ],
    submitLabel: "Add Deliverable",
    onSubmit(values) {
      deliverableTracker.unshift({ ...values, docNo: values.docNo || `LB-NEW-${String(deliverableTracker.length + 1).padStart(3, "0")}`, status: "Not Started" });
      renderTracker();
      prependActivity({ initials: initialsOf(profileState.name), text: `${initialsOf(profileState.name)} added <b>${escapeHtml(values.title)}</b>`, tag: escapeHtml(values.tower) });
      showToast(`Deliverable "${values.title}" added to ${values.tower} · ${values.floor}.`);
    }
  });
}

function openTransmittalDialog() {
  const firstWing = transmittalWings[0];
  const defaults = transmittalDefaults(firstWing);
  const drawingFiles = projectFiles.filter((file) => /\.(dwg|dxf|pdf|rvt)$/i.test(file.name)).map((file) => file.name);
  openActionDialog({
    title: "Create Transmittal",
    subtitle: "Saved as Pending — review and send it from the Transmittals list.",
    fields: [
      { type: "row", fields: [
        { name: "wing", label: "Wing", type: "select", options: transmittalWings, value: firstWing },
        { name: "source", label: "Source", type: "select", options: transmittalSources, value: defaults.source }
      ] },
      { name: "recipient", label: "Recipient", value: defaults.recipient, placeholder: "Who receives the drawings" },
      { type: "row", fields: [
        { name: "color", label: "Colour copies", type: "number", min: 0, value: defaults.copies.color },
        { name: "bw", label: "B&W copies", type: "number", min: 0, value: defaults.copies.bw }
      ] },
      { name: "files", label: "Drawings from Files", type: "checklist", options: drawingFiles }
    ],
    submitLabel: "Create & Review",
    onSubmit(values) {
      if (!values.files.length) {
        setActionError("Pick at least one drawing to send.");
        return false;
      }
      const transmittal = {
        no: nextTransmittalNo(),
        wing: values.wing,
        source: values.source,
        recipient: values.recipient,
        recipientRole: transmittalsSentNewestFirst().find((item) => item.recipient === values.recipient)?.recipientRole || "",
        purpose: "For construction",
        copies: { color: Number(values.color) || 0, bw: Number(values.bw) || 0 },
        status: "pending",
        sent: null,
        created: toDateInput(new Date()),
        origin: "manual",
        by: profileState.name,
        remarks: "",
        drawings: values.files.map((name, index) => drawingFromFile(name, values.wing, index)),
        activity: [`Created by ${profileState.name}`]
      };
      transmittals.push(transmittal);
      renderTransmittals();
      prependActivity({ initials: initialsOf(profileState.name), text: `${initialsOf(profileState.name)} drafted <b>${transmittal.no}</b> for ${escapeHtml(values.wing)}`, tag: `${values.files.length} dwgs` });
      // Open the new draft for review once this dialog has closed
      setTimeout(() => {
        if (overviewPage.hidden || projectSubViews.transmittals.hidden) openProject(overviewPage.querySelector(".project-title").textContent, "transmittals");
        const row = document.querySelector(`#transmittal-list tr[data-transmittal-index="${transmittals.indexOf(transmittal)}"]`);
        if (row) openTransmittalDrawer(row);
      });
    }
  });

  // Recipient, source and copies follow the chosen wing's history
  document.getElementById("action-wing").addEventListener("change", (e) => {
    const wingDefaults = transmittalDefaults(e.target.value);
    if (!document.getElementById("action-recipient").value || document.getElementById("action-recipient").value === defaults.recipient) {
      document.getElementById("action-recipient").value = wingDefaults.recipient;
    }
    document.getElementById("action-source").value = wingDefaults.source;
  });
}

function openAddMemberDialog() {
  openActionDialog({
    title: "Add Member",
    subtitle: overviewPage.querySelector(".project-title").textContent,
    fields: [
      { name: "name", label: "Full name", required: true, placeholder: "e.g. Kavya Iyer" },
      { type: "row", fields: [
        { name: "role", label: "Role", placeholder: "e.g. Electrical Engineer", required: true },
        { name: "team", label: "Team", type: "select", options: teamGroups.map((group) => group.label) }
      ] },
      { type: "row", fields: [
        { name: "discipline", label: "Discipline", type: "select", options: ["MEP", ...disciplineOptions, "Architecture", "Cost", "Construction"] },
        { name: "org", label: "Organisation", type: "select", options: ["Lodha", ...consultantOptions] }
      ] }
    ],
    submitLabel: "Add Member",
    onSubmit(values) {
      const group = teamGroups.find((g) => g.label === values.team).key;
      teamMembers.push({ name: values.name, role: values.role, org: values.org, discipline: values.discipline, group, tasks: 0 });
      openTeamFolders.add(group);
      renderTeam();
      prependActivity({ initials: initialsOf(profileState.name), text: `${initialsOf(profileState.name)} added <b>${escapeHtml(values.name)}</b> to ${escapeHtml(values.team)}`, tag: escapeHtml(values.org) });
      showToast(`${values.name} added to ${values.team}.`);
    }
  });
}

const parseGuestEmails = (text) => text.split(/[\s,;]+/).map((email) => email.trim()).filter(Boolean);
const validEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

function openScheduleMeetingDialog() {
  const onProject = !overviewPage.hidden;
  openActionDialog({
    title: "Schedule Meeting",
    subtitle: onProject ? overviewPage.querySelector(".project-title").textContent : "",
    fields: [
      { name: "title", label: "Meeting subject", required: true, placeholder: "e.g. Facade MEP Coordination" },
      { type: "row", fields: [
        { name: "date", label: "Date", type: "date", required: true, value: toDateInput(new Date()) },
        { name: "type", label: "Type", type: "select", options: ["Online", "In person"] }
      ] },
      { type: "row", fields: [
        { name: "start", label: "Start", type: "time", required: true, value: "15:00" },
        { name: "end", label: "End", type: "time", required: true, value: "16:00" }
      ] },
      { name: "place", label: "Location / link", placeholder: "Teams link or meeting room" },
      { name: "people", label: "Invite people", type: "people" },
      { name: "guests", label: "Guests outside Atelier", placeholder: "Emails, separated by commas" },
      { name: "message", label: "Invite message", type: "textarea", placeholder: "Agenda or anything attendees should prepare..." },
      { name: "send", label: "Send calendar invites now", type: "checkbox", value: true }
    ],
    submitLabel: "Schedule",
    onSubmit(values) {
      const start = new Date(`${values.date}T${values.start}`);
      const end = new Date(`${values.date}T${values.end}`);
      if (!(end > start)) {
        setActionError("End time must be after the start time.");
        return false;
      }
      const guests = parseGuestEmails(values.guests);
      const invalid = guests.filter((email) => !validEmail(email));
      if (invalid.length) {
        setActionError(`Check these guest emails: ${invalid.join(", ")}`);
        return false;
      }

      const online = values.type === "Online";
      const invited = values.people.length + guests.length;
      meetings.push({
        id: `m${++meetingSeq}`,
        start,
        end,
        title: values.title,
        type: online ? "online" : "in-person",
        place: values.place || (online ? "Teams link" : "To be confirmed"),
        project: onProject ? overviewPage.querySelector(".project-title").textContent : "General",
        attendees: invited + 1,
        invitees: values.people,
        guests,
        status: "join"
      });
      renderSchedule();
      const when = `${start.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} at ${values.start}`;
      showToast(values.send && invited
        ? `"${values.title}" scheduled for ${when} · invites sent to ${invited} ${invited === 1 ? "person" : "people"}.`
        : `"${values.title}" scheduled for ${when}.`);
    }
  });
}

document.addEventListener("click", (e) => {
  const button = e.target.closest("[data-project-action]");
  if (!button) return;
  button.blur();
  const action = button.dataset.projectAction;
  if (action === "add-deliverable") openAddDeliverableDialog(button.closest("#dashboard-deliverables-panel") ? "dashboard" : "project");
  else if (action === "transmittal") openTransmittalDialog();
  else if (action === "add-member") openAddMemberDialog();
  else if (action === "schedule-meeting") openScheduleMeetingDialog();
});

/* PROJECT FILES (overview Recent Uploads + Files tab) */
const overviewUploadInput = document.getElementById("overview-upload-input");
const projectFilesGrid = document.getElementById("project-files-grid");
const projectFileSearch = document.getElementById("project-file-search");
let projectFileType = "all";

const projectFiles = [
  { name: "Structural_L4_Slab_Reinforcement_v2.pdf", stage: "VFC", location: "Structure · Wing 26 · L4", size: "14.2 MB", by: "Apurva B.", when: "Just Now" },
  { name: "HVAC_Equipment_Schedule_Datasheet_Chillers.xls", stage: "DD", location: "Structure · Wing 26 · L4", size: "14.2 MB", by: "Apurva B.", when: "2 hrs ago" },
  { name: "Fire_Strategy_NOC_Approval_Letter.pdf", stage: "DD", location: "Site Team · Wing 12", size: "2.1 MB", by: "Sanjay Rao", when: "1 day ago" },
  { name: "Plumbing_Single_Line_Diagram_R3.dwg", stage: "Tender", location: "JV Consultant · Wing 25", size: "28.5 MB", by: "Rajesh K.", when: "2 hrs ago" },
  { name: "Electrical_Lighting_Layout_RevC.pdf", stage: "GFC", location: "Electrical · Tower 26", size: "6.8 MB", by: "Sachin Patil", when: "2 hrs ago" },
  { name: "Drainage_Calculations_Tower16.xlsx", stage: "DD", location: "Plumbing · Tower 16", size: "1.4 MB", by: "Neha Kapoor", when: "Yesterday" },
  { name: "Fire_Pump_Room_Layout.dwg", stage: "VFC", location: "Fire · UGT 2", size: "19.3 MB", by: "Rohit Patil", when: "Yesterday" },
  { name: "UGT2_Site_Photos.zip", stage: "Site", location: "Site Team · UGT 2", size: "48.0 MB", by: "Rohit Patil", when: "3 days ago" }
];

function fileKind(name) {
  const extension = name.split(".").pop().toLowerCase();
  if (extension === "pdf") return { kind: "pdf", icon: "is-pdf", label: "PDF" };
  if (["xls", "xlsx", "csv"].includes(extension)) return { kind: "sheet", icon: "is-sheet", label: "XLS" };
  if (["dwg", "dxf", "rvt"].includes(extension)) return { kind: "drawing", icon: "is-drawing", label: "DWG" };
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(extension)) return { kind: "other", icon: "is-drawing", label: "IMG" };
  return { kind: "other", icon: "", label: extension.slice(0, 4).toUpperCase() || "FILE" };
}

function formatFileSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function uploadCardHtml(file) {
  const kind = fileKind(file.name);
  const index = projectFiles.indexOf(file);
  return `
    <article class="upload-card" data-file-index="${index}">
      <header><span class="upload-file-icon ${kind.icon}" aria-hidden="true">${kind.label}</span><span class="upload-type">${escapeHtml(file.stage)}</span></header>
      <strong>${escapeHtml(file.name)}</strong>
      <p>${escapeHtml(file.location)}</p>
      <small>${escapeHtml(file.size)} · Uploaded by ${escapeHtml(file.by)} · ${escapeHtml(file.when)}</small>
      <div class="upload-actions"><button type="button" data-file-action="open">Open</button><button type="button" class="upload-download" data-file-action="download"><span aria-hidden="true">⇩</span> Download</button></div>
    </article>`;
}

function renderFiles() {
  document.getElementById("overview-upload-grid").innerHTML = projectFiles.slice(0, 4).map(uploadCardHtml).join("");

  const query = projectFileSearch.value.trim().toLocaleLowerCase();
  const visible = projectFiles.filter((file) => (projectFileType === "all" || fileKind(file.name).kind === projectFileType)
    && `${file.name} ${file.location} ${file.by}`.toLocaleLowerCase().includes(query));
  projectFilesGrid.innerHTML = visible.map(uploadCardHtml).join("");
  document.getElementById("project-files-empty").hidden = visible.length !== 0;
}

function downloadProjectFile(file) {
  if (file.file) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file.file);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);
    return;
  }
  // Seeded demo files have no stored copy
  showToast(`Downloading ${file.name}…`);
}

function openFilePreview(file) {
  showDocument("file", projectFiles.indexOf(file));
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-overview-upload-trigger]")) {
    overviewUploadInput.click();
    return;
  }

  const fileButton = e.target.closest("[data-file-action]");
  if (!fileButton) return;
  const file = projectFiles[Number(fileButton.closest("[data-file-index]").dataset.fileIndex)];
  if (fileButton.dataset.fileAction === "open") openFilePreview(file);
  else downloadProjectFile(file);
});

// Uploads ask which wing and stage they belong to; IFC drawings draft a transmittal for that wing
overviewUploadInput.addEventListener("change", () => {
  const added = Array.from(overviewUploadInput.files);
  overviewUploadInput.value = "";
  if (!added.length) return;

  openActionDialog({
    title: `Upload ${added.length === 1 ? added[0].name : `${added.length} files`}`,
    subtitle: overviewPage.querySelector(".project-title").textContent,
    body: `<p class="action-dialog-text">Uploading as <b>IFC</b> drafts a transmittal for the wing automatically. Nothing is sent until you approve it.</p>`,
    fields: [
      { type: "row", fields: [
        { name: "wing", label: "Wing / Tower", type: "select", options: transmittalWings },
        { name: "stage", label: "Stage", type: "select", options: ["WIP", "DD", "Tender", "IFC", "VFC", "As-built"], value: "IFC" }
      ] }
    ],
    submitLabel: "Upload",
    onSubmit(values) {
      const uploader = `${firstName(profileState.name)} ${profileState.name.split(/\s+/)[1]?.[0] || ""}.`.replace(/ \.$/, "");
      [...added].reverse().forEach((file) => {
        projectFiles.unshift({ name: file.name, stage: values.stage, location: values.wing, size: formatFileSize(file.size), by: uploader, when: "Just Now", file });
      });
      renderFiles();
      prependActivity({ initials: initialsOf(profileState.name), text: `${initialsOf(profileState.name)} uploaded <b>${escapeHtml(added.length === 1 ? added[0].name : `${added.length} files`)}</b> (${values.stage})`, tag: escapeHtml(values.wing) });

      if (values.stage === "IFC") {
        const transmittal = draftTransmittalFromIfc(added, values.wing);
        showToast(`Uploaded. ${transmittal.no} drafted for ${values.wing} — review and send it from Transmittals.`);
      } else {
        showToast(added.length === 1 ? `${added[0].name} uploaded.` : `${added.length} files uploaded.`);
      }
    }
  });
});

document.querySelectorAll("[data-file-type]").forEach((chip) => {
  chip.addEventListener("click", () => {
    projectFileType = chip.dataset.fileType;
    document.querySelectorAll("[data-file-type]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderFiles();
  });
});
projectFileSearch.addEventListener("input", renderFiles);

/* PROJECT TEAM: your MEP team up front, other teams in folders that open in place */
const teamGroups = [
  { key: "mep", label: "MEP Design", full: "MEP Design Team" },
  { key: "architectural", label: "Architectural", full: "Architecture & interiors" },
  { key: "dco", label: "DCO", full: "Design Cost Optimisation" },
  { key: "site", label: "Site Team", full: "Construction Management" },
  { key: "consultants", label: "Consultants", full: "External MEP consultants" }
];
const folderIcon = '<svg width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M14.6673 12.6667C14.6673 13.0203 14.5268 13.3594 14.2768 13.6095C14.0267 13.8595 13.6876 14 13.334 14H2.66732C2.3137 14 1.97456 13.8595 1.72451 13.6095C1.47446 13.3594 1.33398 13.0203 1.33398 12.6667V3.33333C1.33398 2.97971 1.47446 2.64057 1.72451 2.39052C1.97456 2.14048 2.3137 2 2.66732 2H6.00065L7.33398 4H13.334C13.6876 4 14.0267 4.14048 14.2768 4.39052C14.5268 4.64057 14.6673 4.97971 14.6673 5.33333V12.6667Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const teamMembers = [
  { name: "Apurva Bhadange", role: "MEP Design Lead", org: "Lodha", discipline: "MEP", group: "mep", tasks: 6 },
  { name: "Riya Shah", role: "MEP Designer", org: "Lodha", discipline: "Plumbing", group: "mep", tasks: 7 },
  { name: "Fatima Khan", role: "Electrical Design Engineer", org: "Lodha", discipline: "Electrical", group: "mep", tasks: 3 },
  { name: "Neha Kapoor", role: "HVAC Design Engineer", org: "Lodha", discipline: "HVAC", group: "mep", tasks: 4 },
  { name: "Ananya Rao", role: "Lead Architect", org: "Lodha", discipline: "Architecture", group: "architectural", tasks: 5 },
  { name: "Vikram Sethi", role: "Facade Architect", org: "Lodha", discipline: "Architecture", group: "architectural", tasks: 2 },
  { name: "Priya Shah", role: "Design Program Manager", org: "Lodha", discipline: "Coordinated", group: "architectural", tasks: 4 },
  { name: "Arjun Mehta", role: "DCO Lead", org: "Lodha", discipline: "Cost", group: "dco", tasks: 2 },
  { name: "Kavita Nair", role: "Cost Analyst", org: "Lodha", discipline: "Cost", group: "dco", tasks: 3 },
  { name: "Sachin Patil", role: "Project Manager", org: "Lodha", discipline: "Construction", group: "site", tasks: 9 },
  { name: "Rohit Patil", role: "Site Engineer", org: "Lodha", discipline: "Fire", group: "site", tasks: 5 },
  { name: "Imran Shaikh", role: "MEP Site Engineer", org: "Lodha", discipline: "Electrical", group: "site", tasks: 4 },
  { name: "Sanjay Rao", role: "Fire Consultant", org: "Verdant Systems", discipline: "Fire", group: "consultants", tasks: 4 },
  { name: "Rajesh K.", role: "Plumbing Consultant", org: "Verdant Systems", discipline: "Plumbing", group: "consultants", tasks: 2 },
  { name: "Meera Joshi", role: "HVAC Consultant", org: "Verdant Systems", discipline: "HVAC", group: "consultants", tasks: 3 },
  { name: "Karan Desai", role: "Electrical Consultant", org: "Verdant Systems", discipline: "Electrical", group: "consultants", tasks: 1 }
];
const openTeamFolders = new Set();
const teamSearch = document.getElementById("project-team-search");
const teamExpandAll = document.getElementById("team-expand-all");

const teamCardHtml = (member) => `
  <article class="team-card">
    <span class="activity-avatar team-avatar">${escapeHtml(initialsOf(member.name))}</span>
    <div class="team-card-copy">
      <strong>${escapeHtml(member.name)}</strong>
      <span>${escapeHtml(member.role)}</span>
    </div>
    <div class="team-card-tags">
      <span class="activity-tag">${escapeHtml(member.org)}</span>
      <span class="activity-tag">${escapeHtml(member.discipline)}</span>
    </div>
    <footer class="team-card-footer">
      <small><strong>${member.tasks}</strong> open tasks</small>
      <button class="comment-btn" type="button" data-assign-to="${escapeHtml(member.name)}">Assign Task</button>
    </footer>
  </article>`;

function renderTeam() {
  const query = teamSearch.value.trim().toLocaleLowerCase();
  const matches = (member, group) => `${member.name} ${member.role} ${member.org} ${member.discipline} ${group.label} ${group.full}`.toLocaleLowerCase().includes(query);
  let shown = 0;

  const mepGroup = teamGroups[0];
  const mep = teamMembers.filter((member) => member.group === mepGroup.key && matches(member, mepGroup));
  document.getElementById("team-mep-grid").innerHTML = mep.map(teamCardHtml).join("");
  document.getElementById("team-mep-count").textContent = String(mep.length).padStart(2, "0");
  document.getElementById("team-mep-grid").closest(".team-section").hidden = Boolean(query) && !mep.length;
  shown += mep.length;

  const folders = teamGroups.slice(1).map((group) => {
    const all = teamMembers.filter((member) => member.group === group.key);
    const members = all.filter((member) => matches(member, group));
    if (query && !members.length) return "";
    shown += members.length;
    // A search opens every folder with a match so results are never hidden behind a click
    const open = openTeamFolders.has(group.key) || Boolean(query);
    const preview = all.slice(0, 4).map((member) => `<i>${escapeHtml(initialsOf(member.name))}</i>`).join("");
    return `
      <section class="team-folder${open ? " is-open" : ""}">
        <button class="team-folder-head" type="button" data-team-folder="${group.key}" aria-expanded="${open}" aria-controls="team-folder-${group.key}">
          <span class="team-folder-icon">${folderIcon}</span>
          <span class="team-folder-copy"><strong>${escapeHtml(group.label)}</strong><small>${escapeHtml(group.full)}</small></span>
          <span class="team-folder-avatars" aria-hidden="true">${preview}${all.length > 4 ? `<i>+${all.length - 4}</i>` : ""}</span>
          <span class="team-folder-count">${query ? `${members.length} of ${all.length}` : `${all.length} ${all.length === 1 ? "member" : "members"}`}</span>
          <span class="task-group-chevron" aria-hidden="true"></span>
        </button>
        <div class="team-grid team-folder-body" id="team-folder-${group.key}"${open ? "" : " hidden"}>
          ${members.length ? members.map(teamCardHtml).join("") : '<p class="pref-hint">No one in this team yet. Use Add Member to add someone.</p>'}
        </div>
      </section>`;
  }).join("");
  document.getElementById("team-folders").innerHTML = folders;
  document.getElementById("team-folders").closest(".team-section").hidden = !folders.trim();
  document.getElementById("project-team-empty").hidden = shown !== 0;

  const allOpen = teamGroups.slice(1).every((group) => openTeamFolders.has(group.key));
  teamExpandAll.textContent = allOpen ? "Collapse all teams" : "Expand all teams";
  teamExpandAll.setAttribute("aria-pressed", String(allOpen));

  document.getElementById("metric-team").textContent = teamMembers.length;
  document.getElementById("metric-firms").textContent = new Set(teamMembers.map((member) => member.org)).size;
}

document.getElementById("team-folders").addEventListener("click", (e) => {
  const head = e.target.closest("[data-team-folder]");
  if (!head) return;
  const key = head.dataset.teamFolder;
  if (openTeamFolders.has(key)) openTeamFolders.delete(key);
  else openTeamFolders.add(key);
  renderTeam();
  document.querySelector(`[data-team-folder="${key}"]`).focus();
});

teamExpandAll.addEventListener("click", () => {
  const allOpen = teamGroups.slice(1).every((group) => openTeamFolders.has(group.key));
  teamGroups.slice(1).forEach((group) => {
    if (allOpen) openTeamFolders.delete(group.key);
    else openTeamFolders.add(group.key);
  });
  renderTeam();
});

teamSearch.addEventListener("input", renderTeam);

document.addEventListener("click", (e) => {
  const button = e.target.closest("[data-assign-to]");
  if (button) openTaskDialog(button.dataset.assignTo);
});

/* PROJECT MILESTONES (View All) */
const projectMilestones = [
  { title: "Concept design sign-off", date: "14 Feb 2026", complete: true },
  { title: "Spatial Coordination", date: "24 Feb 2026", complete: true },
  { title: "Schematic MEP Design Freeze", date: "18 May 2026", complete: true },
  { title: "Facade Package Issue", date: "05 Sep 2026", complete: false },
  { title: "MEP Coordination Review", date: "12 Oct 2026", complete: false },
  { title: "Tender Drawings — Plumbing & Fire", date: "30 Nov 2026", complete: false },
  { title: "Fire Tender Package", date: "14 Feb 2027", complete: false },
  { title: "Testing & Commissioning Plan", date: "18 May 2027", complete: false }
];
let milestoneFilter = "all";

function renderMilestones() {
  const visible = projectMilestones.filter((m) => milestoneFilter === "all" || (milestoneFilter === "complete" ? m.complete : !m.complete));
  document.getElementById("project-milestone-list").innerHTML = visible.map((m) => `
    <li class="milestone-item${m.complete ? " is-complete" : ""}">
      <span class="milestone-track"><i aria-hidden="true">${m.complete ? "✓" : ""}</i></span>
      <span class="milestone-copy"><strong>${escapeHtml(m.title)}</strong><small>${m.date}</small></span>
      <span class="milestone-status${m.complete ? " is-complete" : ""}">${m.complete ? "Completed" : "Upcoming"}</span>
    </li>`).join("");
  document.getElementById("project-milestone-progress").textContent = `${projectMilestones.filter((m) => m.complete).length}/${projectMilestones.length}`;
}

document.querySelectorAll("[data-milestone-filter]").forEach((chip) => {
  chip.addEventListener("click", () => {
    milestoneFilter = chip.dataset.milestoneFilter;
    document.querySelectorAll("[data-milestone-filter]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderMilestones();
  });
});

/* PROJECT ACTIVITY (View All) */
const projectActivity = [
  { initials: "SK", tone: "", text: "SK uploaded <b>Electrical lighting layout Rev C</b>", when: "2 hours ago", tag: "Tower 26" },
  { initials: "PC", tone: "avatar-slate", text: "PC raised <b>RFI-021 facade bracket tolerance</b>", when: "5 hours ago", tag: "MLCP" },
  { initials: "NM", tone: "avatar-brown", text: "NM completed <b>Drainage calculations Tower 16</b>", when: "Yesterday", tag: "Tower 16" },
  { initials: "RS", tone: "avatar-muted", text: "RS approved <b>Fire pump room layout</b>", when: "Yesterday", tag: "UGT 2" },
  { initials: "SP", tone: "avatar-slate", text: "SP moved <b>T-12 Approve Revised Typical Floor</b> to In Progress", when: "2 days ago", tag: "Wing 25" },
  { initials: "AB", tone: "", text: "AB sent <b>TR-237</b> to Pravin Kolapte", when: "3 days ago", tag: "Tower 26" },
  { initials: "RK", tone: "avatar-brown", text: "RK uploaded <b>Plumbing single line diagram R3</b>", when: "4 days ago", tag: "Wing 25" },
  { initials: "SR", tone: "avatar-muted", text: "SR closed <b>RFI-211 infra fire layout</b>", when: "Last week", tag: "Tower 16" },
  { initials: "NK", tone: "avatar-slate", text: "NK scheduled <b>MEP Coordination Review</b>", when: "Last week", tag: "MLCP" },
  { initials: "AB", tone: "", text: "AB completed <b>Spatial Coordination</b> milestone", when: "Last month", tag: "All Towers" }
];
let activityFilter = "all";
const activitySearch = document.getElementById("project-activity-search");

const activityItemHtml = (item) => `
  <li class="activity-item">
    <span class="activity-avatar ${item.tone || ""}">${escapeHtml(item.initials)}</span>
    <span class="activity-copy"><strong>${item.text}</strong><small><span aria-hidden="true">◷</span> ${escapeHtml(item.when)}</small></span>
    <span class="activity-tag">${item.tag}</span>
  </li>`;

function renderActivity() {
  const tags = ["all", ...new Set(projectActivity.map((item) => item.tag))];
  document.getElementById("project-activity-filters").innerHTML = tags.map((tag) => `
    <button class="task-priority-filter${activityFilter === tag ? " is-active" : ""}" type="button" data-activity-filter="${escapeHtml(tag)}" aria-pressed="${activityFilter === tag}">${tag === "all" ? "All" : tag}</button>`).join("");

  const query = activitySearch.value.trim().toLocaleLowerCase();
  const visible = projectActivity.filter((item) => (activityFilter === "all" || item.tag === activityFilter)
    && item.text.replace(/<[^>]+>/g, "").toLocaleLowerCase().includes(query));
  document.getElementById("project-activity-list").innerHTML = visible.length
    ? visible.map(activityItemHtml).join("")
    : '<li class="policy-empty">No activity matches these filters.</li>';
}

// New project events show up first on the overview and in All Activity
function prependActivity(item) {
  const entry = { tone: "", when: "Just now", ...item };
  projectActivity.unshift(entry);
  const overviewList = document.getElementById("overview-activity-list");
  overviewList.insertAdjacentHTML("afterbegin", activityItemHtml(entry));
  overviewList.lastElementChild?.remove();
  renderActivity();
}

document.getElementById("project-activity-filters").addEventListener("click", (e) => {
  const chip = e.target.closest("[data-activity-filter]");
  if (!chip) return;
  activityFilter = chip.dataset.activityFilter;
  renderActivity();
});
activitySearch.addEventListener("input", renderActivity);

/* LIBRARY TABS */
const libraryHeading = document.getElementById("library-ref-heading");
const policyBrowser = document.querySelector(".policy-browser");
let currentLibraryTab = "policies";

const iso = (daysAgo) => toDateInput(new Date(Date.now() - daysAgo * 86400000));

const libraryTabs = {
  policies: { label: "Policies", ref: "Policy No.", docs: Array.from(policyList.rows, (row) => ({
    no: row.cells[0].textContent.trim(),
    name: row.cells[1].querySelector("strong").textContent.trim(),
    meta: row.cells[1].querySelector("small").textContent.trim(),
    version: row.cells[2].textContent.trim(),
    updated: row.dataset.updated,
    category: row.dataset.policyCategory
  })) },
  learnings: { label: "Learnings", ref: "Ref No.", docs: [
    { no: "LL-014", name: "Chiller plant room access — lessons from Lodha One", meta: "Case note · 6 Pages", version: "v1.2", updated: iso(12), category: "hvac" },
    { no: "LL-013", name: "Avoiding sleeve misses in PT slabs", meta: "Checklist · 3 Pages", version: "v1.0", updated: iso(26), category: "general" },
    { no: "LL-011", name: "Fire NOC rework: common authority comments", meta: "Case note · 9 Pages", version: "v2.0", updated: iso(41), category: "fire" },
    { no: "LL-009", name: "STP odour complaints after handover", meta: "Post-occupancy review · 5 Pages", version: "v1.1", updated: iso(63), category: "phe" },
    { no: "LL-007", name: "Bus duct vs cable riser — cost and time comparison", meta: "Study · 12 Pages", version: "v1.0", updated: iso(90), category: "electrical" }
  ] },
  boqs: { label: "BOQs", ref: "BOQ No.", docs: [
    { no: "BOQ-HV-03", name: "HVAC — VRF system, typical residential floor", meta: "Excel · 412 line items", version: "v3.1", updated: iso(8), category: "hvac" },
    { no: "BOQ-PH-05", name: "Plumbing — internal water supply & drainage", meta: "Excel · 286 line items", version: "v2.4", updated: iso(19), category: "phe" },
    { no: "BOQ-FF-02", name: "Firefighting — sprinkler & hydrant system", meta: "Excel · 198 line items", version: "v2.0", updated: iso(33), category: "fire" },
    { no: "BOQ-EL-04", name: "Electrical — LT panels, cabling & lighting", meta: "Excel · 530 line items", version: "v4.2", updated: iso(47), category: "electrical" }
  ] },
  makes: { label: "Approved Makes", ref: "Make ID", docs: [
    { no: "AM-HV-01", name: "Chillers & VRF outdoor units", meta: "4 approved makes", version: "2026", updated: iso(15), category: "hvac" },
    { no: "AM-EL-02", name: "LT switchgear & MCBs", meta: "5 approved makes", version: "2026", updated: iso(15), category: "electrical" },
    { no: "AM-PH-03", name: "CPVC / uPVC pipes & fittings", meta: "3 approved makes", version: "2026", updated: iso(30), category: "phe" },
    { no: "AM-FF-04", name: "Fire pumps & sprinklers", meta: "4 approved makes", version: "2026", updated: iso(30), category: "fire" },
    { no: "AM-GN-05", name: "Lifts & escalators", meta: "3 approved makes", version: "2025", updated: iso(120), category: "general" }
  ] },
  mas: { label: "MAS Library", ref: "MAS No.", docs: [
    { no: "MAS-221", name: "Air-cooled screw chiller submittal", meta: "PDF · 38 Pages", version: "Rev B", updated: iso(5), category: "hvac" },
    { no: "MAS-219", name: "Diesel fire pump set", meta: "PDF · 22 Pages", version: "Rev A", updated: iso(14), category: "fire" },
    { no: "MAS-214", name: "LT panel — main distribution board", meta: "PDF · 41 Pages", version: "Rev C", updated: iso(28), category: "electrical" },
    { no: "MAS-209", name: "Hydro-pneumatic pumping system", meta: "PDF · 17 Pages", version: "Rev A", updated: iso(44), category: "phe" }
  ] },
  drawings: { label: "Standard Drawings", ref: "Drawing No.", docs: [
    { no: "SD-EL-101", name: "Typical flat electrical layout — 2 BHK", meta: "DWG · A1", version: "R4", updated: iso(10), category: "electrical" },
    { no: "SD-PH-204", name: "Toilet plumbing details", meta: "DWG · A1", version: "R3", updated: iso(22), category: "phe" },
    { no: "SD-FF-301", name: "Fire pump room typical layout", meta: "DWG · A0", version: "R2", updated: iso(39), category: "fire" },
    { no: "SD-HV-402", name: "Typical AHU room arrangement", meta: "DWG · A1", version: "R1", updated: iso(70), category: "hvac" }
  ] },
  books: { label: "Reference Books", ref: "Ref No.", docs: [
    { no: "RB-01", name: "National Building Code of India — Part 4 & 9", meta: "Reference · MEP extracts", version: "2016", updated: iso(200), category: "general" },
    { no: "RB-02", name: "ASHRAE Handbook — HVAC Applications", meta: "Reference", version: "2023", updated: iso(150), category: "hvac" },
    { no: "RB-03", name: "Plumbing Code — Uniform Plumbing Code India", meta: "Reference", version: "2020", updated: iso(240), category: "phe" }
  ] },
  catalogues: { label: "Catalogues", ref: "Cat. No.", docs: [
    { no: "CAT-118", name: "Light fixtures — common areas", meta: "PDF · 64 Pages", version: "2026", updated: iso(9), category: "electrical" },
    { no: "CAT-112", name: "Sanitaryware & CP fittings", meta: "PDF · 88 Pages", version: "2026", updated: iso(25), category: "phe" },
    { no: "CAT-107", name: "Grilles, diffusers & dampers", meta: "PDF · 46 Pages", version: "2025", updated: iso(80), category: "hvac" }
  ] }
};

const formatLongDate = (isoDate) => {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
};

function setLibraryTab(key) {
  if (!libraryTabs[key]) key = "policies";
  currentLibraryTab = key;
  const tab = libraryTabs[key];

  document.querySelectorAll("[data-library-tab]").forEach((button) => {
    const isActive = button.dataset.libraryTab === key;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });

  libraryHeading.textContent = tab.ref;
  policyBrowser.setAttribute("aria-label", tab.label);
  policySearchInput.placeholder = `Search ${tab.label.toLowerCase()}...`;
  policySearchInput.setAttribute("aria-label", `Search ${tab.label.toLowerCase()}`);
  policyList.innerHTML = tab.docs.map((doc, index) => `
    <tr data-policy-category="${doc.category}" data-updated="${doc.updated}" data-doc-index="${index}" tabindex="0">
      <td>${escapeHtml(doc.no)}</td>
      <td><strong>${escapeHtml(doc.name)}</strong><small>${escapeHtml(doc.meta)}</small></td>
      <td>${escapeHtml(doc.version)}</td>
      <td>${formatLongDate(doc.updated)}</td>
    </tr>`).join("");

  if (policySortSelect.value === "name") policySortSelect.dispatchEvent(new Event("change"));
  filterPolicies();
  const showMakes = key === "makes";
  policyBrowser.hidden = showMakes;
  makesBrowser.hidden = !showMakes;
  if (showMakes) renderMakes();
  renderBreadcrumb([{ label: "Library", view: "library" }, { label: tab.label }]);
  syncHash(key === "policies" ? "library" : `library/${key}`);
}

function openLibraryDocument(row) {
  showDocument("library", `${currentLibraryTab}-${row.dataset.docIndex}`);
}

const lockIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';

// Sample first page of a library document until the real files are connected
function libraryPageHtml(doc, tabKey) {
  const kicker = tabKey === "policies" ? "MEP Policy" : libraryTabs[tabKey].label;
  return `
    <article class="doc-page" aria-label="${escapeHtml(doc.name)}, page 1">
      <p class="doc-page-kicker">${escapeHtml(kicker)} · ${escapeHtml(doc.no)}</p>
      <h3>${escapeHtml(doc.name)}</h3>
      <p class="doc-page-meta">Version ${escapeHtml(doc.version)} · Effective ${formatLongDate(doc.updated)} · Discipline: ${escapeHtml(doc.category.toUpperCase())}</p>
      <h4>1. Purpose</h4>
      <p>Sets out the minimum design and documentation requirements covered by this document, so every project applies them the same way.</p>
      <h4>2. Scope</h4>
      <p>Applies to all towers, podiums, basements and MLCPs at concept, design development, GFC and VFC stages, for in-house teams and appointed consultants.</p>
      <h4>3. Revision history</h4>
      <table class="doc-page-table">
        <thead><tr><th>Version</th><th>Date</th><th>Change</th></tr></thead>
        <tbody><tr><td>${escapeHtml(doc.version)}</td><td>${formatLongDate(doc.updated)}</td><td>Current issue</td></tr></tbody>
      </table>
      <p class="doc-page-note">Sample page — the document itself will display here once documents are connected.</p>
    </article>`;
}

/* BOQs (Library tab): view the bill of quantities like the spreadsheet, and download it as Excel */
const boqSheets = {
  "BOQ-PH-05": [
    {
      bill: "Bill No.1 - Drainage Installations",
      notes: [
        "Include for the supply, complete installation, Testing & Commissioning as detailed in the specifications, Drawings and as per approved make list to the complete satisfaction and approval of the Engineer and all concerned Statutory Authorities and under the following sections.",
        "Pipe work of waste, soil, condensate, vent, rainwater etc. including fittings, bends, elbows, rodding eyes/cleanout, end caps, supports, accessories etc. complete. All drainage outlet in toilet/utility/kitchen/deck area, drainage pipe shall be extended by 200mm from finished level."
      ],
      items: [
        { no: "1", desc: "Waste Pipes Inside the Toilet of UPVC SWR Type-B solvent joint as per IS 13592 for pipes 75 mm and above, UPVC Class-3/4/5 as per IS 4985 for pipes Below 75 mm", unit: "", qty: "" },
        { no: "2", desc: "Soil pipe of Low noise UPVC SWR solvent joint type for inside toilet - Underslung (2-4 LPS@20-26 dB respectively) as per standard EN1329, density (g/cm3): 1.3 to 1.9.\n110 mm dia Soil pipe (WC up-to vertical riser only)", unit: "RMT", qty: "" },
        { no: "3", desc: "Soil pipe of UPVC SWR Type-B IS 13592 solvent joint for inside sunken toilet\n110 mm dia Soil pipe (WC up-to vertical riser)", unit: "RMT", qty: "" },
        { no: "5.1", desc: "Soil, Waste, Rain water, Condensate drain down take pipe inside shaft of UPVC Class 3 solvent joint in accordance to IS4985", unit: "RMT", qty: "" },
        { no: "6.1", desc: "C.I. hubless pipe for Soil, waste, rain water pipes in accordance to IS:1536 for last one floor and Suspended ceiling diversion", unit: "RMT", qty: "" },
        { no: "7.1", desc: "HDPE PE100 PN 10 pipe for Soil, waste, rain water pipes in accordance to IS:14333 for last one floor and Suspended ceiling diversion", unit: "RMT", qty: "" },
        { no: "8.1", desc: "HDPE PN10 coupler", unit: "NOS", qty: "" }
      ]
    }
  ],
  "BOQ-HV-03": [
    {
      bill: "Bill No.1 - VRF System (Typical Residential Floor)",
      notes: ["Supply, installation, testing and commissioning of the VRF system complete with controls, as per specifications, drawings and the approved make list."],
      items: [
        { no: "1", desc: "VRF outdoor unit, heat pump, 16 HP", unit: "NOS", qty: "4" },
        { no: "2", desc: "Ceiling cassette indoor unit, 1.5 TR", unit: "NOS", qty: "24" },
        { no: "3", desc: "Ductable indoor unit, 3 TR, with plenum and grilles", unit: "NOS", qty: "6" },
        { no: "4", desc: "Refrigerant copper piping with nitrile rubber insulation, all sizes", unit: "RMT", qty: "860" },
        { no: "5", desc: "Condensate drain piping, uPVC 25 mm, with insulation", unit: "RMT", qty: "420" },
        { no: "6", desc: "Wired remote controller", unit: "NOS", qty: "30" }
      ]
    }
  ],
  "BOQ-FF-02": [
    {
      bill: "Bill No.1 - Sprinkler & Hydrant System",
      notes: ["Supply, installation, testing and commissioning of the sprinkler and hydrant systems complete with supports, as per specifications and NBC requirements."],
      items: [
        { no: "1", desc: "Pendant sprinkler, 68°C, K-80, quick response", unit: "NOS", qty: "1240" },
        { no: "2", desc: "MS ERW heavy class pipe, 25 mm to 150 mm, with fittings", unit: "RMT", qty: "3200" },
        { no: "3", desc: "Landing valve, SS internals, with instantaneous outlet", unit: "NOS", qty: "48" },
        { no: "4", desc: "First-aid hose reel drum with 30 m hose", unit: "NOS", qty: "48" },
        { no: "5", desc: "Fire brigade inlet, 4-way", unit: "NOS", qty: "2" }
      ]
    }
  ],
  "BOQ-EL-04": [
    {
      bill: "Bill No.1 - LT Panels",
      notes: ["Supply, installation, testing and commissioning of type-tested LT panels as per single line diagram and approved make list."],
      items: [
        { no: "1", desc: "Main LT panel, 2500 A, Form 4b, with ACBs and metering", unit: "NOS", qty: "1" },
        { no: "2", desc: "Sub-distribution boards, floor-wise", unit: "NOS", qty: "12" }
      ]
    },
    {
      bill: "Bill No.2 - Cabling",
      notes: ["Laying, testing and termination of LT cables on cable trays, including glands and lugs."],
      items: [
        { no: "1", desc: "LT XLPE armoured cable, 3.5C x 300 sqmm, AL", unit: "RMT", qty: "640" },
        { no: "2", desc: "LT XLPE armoured cable, 4C x 16 sqmm, CU", unit: "RMT", qty: "2100" },
        { no: "3", desc: "Perforated cable tray, 300 mm, with supports", unit: "RMT", qty: "900" }
      ]
    }
  ]
};

const boqItemCount = (sheet) => sheet.reduce((sum, bill) => sum + bill.items.length, 0);

// The list shows the real item count of each BOQ
libraryTabs.boqs.docs.forEach((doc) => {
  const sheet = boqSheets[doc.no];
  if (sheet) doc.meta = `Excel · ${boqItemCount(sheet)} line items · ${sheet.length} bill${sheet.length === 1 ? "" : "s"}`;
});

// Spreadsheet rows: bill title, preamble notes, then items (row numbers like the source sheet)
function boqRows(sheet) {
  const rows = [];
  sheet.forEach((bill) => {
    rows.push({ kind: "bill", desc: bill.bill.toUpperCase() });
    bill.notes.forEach((note) => rows.push({ kind: "note", desc: note }));
    bill.items.forEach((item) => rows.push({ kind: "item", ...item }));
  });
  return rows;
}

function boqSheetHtml(doc) {
  const sheet = boqSheets[doc.no] || [];
  const rows = boqRows(sheet);
  return `
    <div class="doc-viewer boq-viewer">
      <div class="doc-viewer-bar">
        <span>${boqItemCount(sheet)} line items · ${sheet.length} bill${sheet.length === 1 ? "" : "s"}</span>
        <label class="policy-search boq-search">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" stroke-width="1.8"/><path d="m13.2 13.2 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          <input type="search" data-boq-search aria-label="Search this BOQ" placeholder="Search items...">
        </label>
      </div>
      <div class="boq-sheet-scroll">
        <table class="boq-sheet">
          <thead><tr><th class="boq-rownum"><span class="visually-hidden">Row</span></th><th class="boq-no">Item</th><th>Item Description</th><th class="boq-unit">Unit</th><th class="boq-qty">Quantity</th></tr></thead>
          <tbody>
            ${rows.map((row, index) => `
              <tr class="boq-${row.kind}" data-boq-row="${row.kind}">
                <td class="boq-rownum">${index + 2}</td>
                <td class="boq-no">${escapeHtml(row.no || "")}</td>
                <td>${escapeHtml(row.desc).replace(/\n/g, "<br>")}</td>
                <td class="boq-unit">${escapeHtml(row.unit || "")}</td>
                <td class="boq-qty">${escapeHtml(row.qty || "")}</td>
              </tr>`).join("")}
          </tbody>
        </table>
        <p class="policy-empty" data-boq-empty hidden>No items match your search.</p>
      </div>
    </div>`;
}

async function downloadBoq(doc, rows) {
  const table = [["Item", "Item Description", "Unit", "Quantity"], ...rows.map((row) => [row.no || "", row.desc, row.unit || "", row.qty || ""])];
  const fileName = `${doc.no} ${doc.name}`.replace(/[\\/:*?"<>|]+/g, "-");
  try {
    const XLSX = await loadSheetJs();
    const sheet = XLSX.utils.aoa_to_sheet(table);
    sheet["!cols"] = [{ wch: 8 }, { wch: 90 }, { wch: 10 }, { wch: 12 }];
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "BOQ");
    XLSX.writeFile(book, `${fileName}.xlsx`);
    showToast(`Downloaded ${doc.no} as Excel.`);
  } catch {
    // Offline: CSV still opens in Excel
    downloadText(`${fileName}.csv`, toCsv(table));
    showToast(`Downloaded ${doc.no} as CSV (Excel reader unavailable offline).`);
  }
}

/* APPROVED MAKES (Library tab): equipment types grouped by discipline */
const makesBrowser = document.getElementById("makes-browser");
const makesSearch = document.getElementById("makes-search");
let makesCategory = "all";
const collapsedMakeGroups = new Set();

const makesGroups = [
  { key: "electrical", label: "Electrical makes", items: [
    { type: "APFC Panel", makes: ["Schneider", "ABB", "L&T", "Epcos"], preferred: "Schneider", code: "IS 26852", notes: "Automatic, thyristor switched", updated: "2026-07-15" },
    { type: "Battery", makes: ["Exide", "Amara Raja", "Luminous"], preferred: "Exide", code: "", notes: "SMF / VRLA", updated: "2026-07-10" },
    { type: "Bus Duct", makes: ["C&S", "Schneider", "ABB"], preferred: "C&S", code: "", notes: "Sandwich type, AL conductor", updated: "2026-07-08" },
    { type: "Cables (LT)", makes: ["Polycab", "Finolex", "Havells"], preferred: "Polycab", code: "IS 7098", notes: "AL/CU XLPE FRLS armoured", updated: "2026-07-02" },
    { type: "DG Set", makes: ["Cummins", "Kirloskar", "Caterpillar"], preferred: "Cummins", code: "IS 4772", notes: "1500 RPM, AMF panel, acoustic enclosure", updated: "2026-06-28" },
    { type: "LT Panel", makes: ["Schneider", "Siemens", "L&T"], preferred: "Schneider", code: "IS/IEC 61439", notes: "Type-tested, Form 4b", updated: "2026-06-24" },
    { type: "Light Fixtures", makes: ["Philips", "Wipro", "Havells"], preferred: "Philips", code: "IS 10322", notes: "LED, 4000K in common areas", updated: "2026-06-18" }
  ] },
  { key: "plumbing", label: "Plumbing makes", items: [
    { type: "Pipes (CPVC)", makes: ["Ashirvad", "Supreme", "Prince"], preferred: "Ashirvad", code: "IS 15778", notes: "SDR 11, hot & cold water", updated: "2026-07-15" },
    { type: "Pipes (uPVC SWR)", makes: ["Supreme", "Finolex", "Prince"], preferred: "Supreme", code: "IS 13592", notes: "Type B, ring-fit joints", updated: "2026-07-05" },
    { type: "Booster Pumps", makes: ["Grundfos", "Wilo", "KSB"], preferred: "Grundfos", code: "", notes: "VFD hydropneumatic system", updated: "2026-06-30" },
    { type: "Sanitaryware", makes: ["Kohler", "Jaquar", "Roca"], preferred: "Kohler", code: "IS 2556", notes: "Wall-hung WCs", updated: "2026-06-21" },
    { type: "CP Fittings", makes: ["Grohe", "Jaquar", "Kohler"], preferred: "Grohe", code: "IS 8931", notes: "Chrome finish, aerated outlets", updated: "2026-06-21" }
  ] },
  { key: "firefighting", label: "Firefighting makes", items: [
    { type: "Sprinklers", makes: ["Tyco", "Viking", "HD Fire"], preferred: "Tyco", code: "IS 15105", notes: "UL/FM listed, 68°C bulb", updated: "2026-07-12" },
    { type: "Fire Pumps", makes: ["Kirloskar", "Grundfos", "Mather+Platt"], preferred: "Kirloskar", code: "IS 12469", notes: "Main, diesel standby and jockey sets", updated: "2026-07-01" },
    { type: "Fire Alarm Panel", makes: ["Notifier", "Siemens", "Bosch"], preferred: "Notifier", code: "IS 2189", notes: "Addressable, networkable", updated: "2026-06-26" },
    { type: "Hydrant Valves", makes: ["Newage", "HD Fire", "Minimax"], preferred: "Newage", code: "IS 5290", notes: "Landing valve, SS internals", updated: "2026-06-20" },
    { type: "GI Pipes", makes: ["Tata", "Jindal", "Apollo"], preferred: "Tata", code: "IS 1239", notes: "Heavy class, ERW", updated: "2026-06-12" }
  ] },
  { key: "hvac", label: "HVAC makes", items: [
    { type: "Chillers", makes: ["Carrier", "Daikin", "Trane"], preferred: "Carrier", code: "", notes: "Water-cooled screw", updated: "2026-07-14" },
    { type: "VRF Systems", makes: ["Daikin", "Mitsubishi", "Hitachi"], preferred: "Daikin", code: "", notes: "Heat pump, inverter outdoor units", updated: "2026-07-09" },
    { type: "AHU", makes: ["Zeco", "Edgetech", "Blue Star"], preferred: "Zeco", code: "", notes: "Double-skin, 50 mm PUF panels", updated: "2026-06-29" },
    { type: "GI Ducting", makes: ["Tata", "JSW"], preferred: "Tata", code: "IS 277", notes: "Factory-fabricated, Pittsburgh lock", updated: "2026-06-22" },
    { type: "Jet Fans", makes: ["Systemair", "Kruger", "Nicotra"], preferred: "Systemair", code: "", notes: "Reversible, 300°C / 2 h rated", updated: "2026-06-15" }
  ] }
];

function renderMakes() {
  const query = makesSearch.value.trim().toLocaleLowerCase();
  let shown = 0;

  document.getElementById("makes-groups").innerHTML = makesGroups
    .filter((group) => makesCategory === "all" || group.key === makesCategory)
    .map((group) => {
      const rows = group.items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => `${item.type} ${item.makes.join(" ")} ${item.code} ${item.notes}`.toLocaleLowerCase().includes(query));
      if (!rows.length) return "";
      shown += rows.length;
      // A search always shows its matches, even in a collapsed group
      const open = Boolean(query) || !collapsedMakeGroups.has(group.key);
      return `
        <section class="makes-group">
          <button class="makes-group-head" type="button" data-makes-toggle="${group.key}" aria-expanded="${open}">
            <span class="task-group-chevron" aria-hidden="true"></span>
            <span class="makes-group-title">${group.label}</span>
            <span class="makes-group-count">${rows.length} equipment type${rows.length === 1 ? "" : "s"}</span>
          </button>
          ${open ? `
          <div class="policy-table-scroll makes-table-scroll">
            <table class="policy-table makes-table">
              <thead><tr><th scope="col">Equipment Type</th><th scope="col">Approved Makes</th><th scope="col">Preferred</th><th scope="col">IS Code</th><th scope="col">Notes</th><th scope="col">Last Updated</th></tr></thead>
              <tbody>
                ${rows.map(({ item, index }) => `
                  <tr data-make-group="${group.key}" data-make-index="${index}" tabindex="0">
                    <td><strong>${escapeHtml(item.type)}</strong></td>
                    <td>${item.makes.map(escapeHtml).join(" / ")}</td>
                    <td><span class="make-chip">${escapeHtml(item.preferred)}</span></td>
                    <td>${escapeHtml(item.code || "—")}</td>
                    <td>${escapeHtml(item.notes)}</td>
                    <td>${formatLongDate(item.updated)}</td>
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>` : ""}
        </section>`;
    }).join("");

  document.getElementById("makes-empty").hidden = shown !== 0;
}

function openMakeDetails(row) {
  const group = makesGroups.find((g) => g.key === row.dataset.makeGroup);
  const item = group.items[Number(row.dataset.makeIndex)];
  openActionDialog({
    title: item.type,
    subtitle: group.label,
    body: `
      <div class="make-chip-list">${item.makes.map((make) => `<span class="make-chip${make === item.preferred ? "" : " is-plain"}">${escapeHtml(make)}${make === item.preferred ? " · Preferred" : ""}</span>`).join("")}</div>
      ${detailList([["IS Code", item.code || "—"], ["Last updated", formatLongDate(item.updated)], ["Notes", item.notes]])}`,
    submitLabel: null,
    cancelLabel: "Close"
  });
}

document.querySelectorAll("[data-makes-category]").forEach((chip) => {
  chip.addEventListener("click", () => {
    makesCategory = chip.dataset.makesCategory;
    document.querySelectorAll("[data-makes-category]").forEach((c) => {
      c.classList.toggle("active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderMakes();
  });
});

makesSearch.addEventListener("input", renderMakes);

document.getElementById("makes-groups").addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-makes-toggle]");
  if (toggle) {
    const key = toggle.dataset.makesToggle;
    if (collapsedMakeGroups.has(key)) collapsedMakeGroups.delete(key);
    else collapsedMakeGroups.add(key);
    renderMakes();
    return;
  }
  const row = e.target.closest("tr[data-make-index]");
  if (row) openMakeDetails(row);
});

document.getElementById("makes-groups").addEventListener("keydown", (e) => {
  const row = e.target.closest("tr[data-make-index]");
  if (row && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    openMakeDetails(row);
  }
});

document.querySelectorAll("[data-library-tab]").forEach((button) => {
  button.addEventListener("click", () => setLibraryTab(button.dataset.libraryTab));
});

policyList.addEventListener("click", (e) => {
  const row = e.target.closest("tr[data-doc-index]");
  if (row) openLibraryDocument(row);
});

policyList.addEventListener("keydown", (e) => {
  const row = e.target.closest("tr[data-doc-index]");
  if (row && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    openLibraryDocument(row);
  }
});

/* REPORTING */
const reportProjects = [
  { name: "Lodha Belmondo", progress: 65, tasks: 18, rfis: 9, delayed: 1, status: "on-track" },
  { name: "Lodha One", progress: 48, tasks: 24, rfis: 6, delayed: 2, status: "at-risk" },
  { name: "Lodha Amara", progress: 72, tasks: 15, rfis: 4, delayed: 0, status: "on-track" },
  { name: "Palava Phase 2", progress: 31, tasks: 21, rfis: 11, delayed: 3, status: "at-risk" },
  { name: "Upper Thane Towers", progress: 84, tasks: 9, rfis: 2, delayed: 0, status: "on-track" },
  { name: "Riverside Retail", progress: 25, tasks: 12, rfis: 5, delayed: 0, status: "on-hold" }
];

// Tasks closed per bucket; the period picks how many buckets and their unit
const reportPeriods = {
  30: { unit: "week", values: [11, 14, 9, 16, 13] },
  90: { unit: "week", values: [8, 12, 10, 7, 13, 15, 11, 9, 14, 16, 12, 13, 17] },
  365: { unit: "month", values: [34, 41, 38, 45, 52, 47, 39, 55, 58, 49, 61, 57] }
};

const reportDisciplines = [
  { icon: "ϟ", name: "Electrical", done: 18, total: 25 },
  { icon: "⌁", name: "Mechanical", done: 13, total: 20 },
  { icon: "♨", name: "Plumbing", done: 9, total: 20 },
  { icon: "♨", name: "Fire", done: 7, total: 12 },
  { icon: "❄", name: "HVAC", done: 11, total: 16 }
];

const statusLabels = { "on-track": "On Track", "at-risk": "At Risk", "on-hold": "On Hold" };

function bucketLabels(unit, count) {
  const labels = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    if (unit === "month") {
      labels.push(new Date(now.getFullYear(), now.getMonth() - i, 1).toLocaleDateString("en-GB", { month: "short" }));
    } else {
      labels.push(`W${getIsoWeek(new Date(now.getTime() - i * 7 * 86400000))}`);
    }
  }
  return labels;
}

function renderReporting() {
  const period = reportPeriods[document.getElementById("report-period").value];
  const closed = period.values.reduce((sum, value) => sum + value, 0);
  const openRfis = reportProjects.reduce((sum, project) => sum + project.rfis, 0);
  const delayed = reportProjects.reduce((sum, project) => sum + project.delayed, 0);
  const onTime = Math.round(((healthData.completed) / (healthData.completed + healthData.delayed)) * 100);

  const kpiIcons = {
    check: railIcons.check,
    folder: railIcons.cube,
    alert: `${svgOpen}<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>`,
    doc: `${svgOpen}<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`
  };
  const kpi = (icon, value, label, tag, tone) => `
    <div class="kpi-card">
      <div class="kpi-top"><div class="kpi-icon ${icon}">${kpiIcons[icon].replace('width="20" height="20"', 'width="16" height="16"')}</div></div>
      <strong>${value}</strong>
      <div class="kpi-bottom"><span>${label}</span><span class="kpi-tag ${tone}">${tag}</span></div>
    </div>`;
  document.getElementById("report-kpis").innerHTML = [
    kpi("check", closed, "Tasks closed", `${period.values.length} ${period.unit}s`, "positive"),
    kpi("folder", `${onTime}%`, "Deliverables on time", `${healthData.delayed} delayed`, "negative"),
    kpi("alert", openRfis, "Open RFIs", "6 blocking", "negative"),
    kpi("doc", delayed, "Delayed items", `across ${reportProjects.filter((p) => p.delayed).length} projects`, "negative")
  ].join("");

  document.getElementById("report-project-rows").innerHTML = reportProjects.map((project) => `
    <tr>
      <td><strong>${project.name}</strong></td>
      <td>
        <span class="report-meter" role="img" aria-label="${project.progress}% complete"><span style="width:${project.progress}%"></span></span>
        <small class="report-meter-value">${project.progress}%</small>
      </td>
      <td>${project.tasks}</td>
      <td>${project.rfis}</td>
      <td>${project.delayed ? `<span class="status overdue">${project.delayed}</span>` : "0"}</td>
      <td><span class="project-state ${project.status}">${statusLabels[project.status]}</span></td>
    </tr>`).join("");

  // Weekly / monthly throughput: one series, so no legend; hover or focus a bar for its value
  const labels = bucketLabels(period.unit, period.values.length);
  const max = Math.max(...period.values);
  const chart = document.getElementById("report-throughput");
  chart.setAttribute("role", "list");
  chart.setAttribute("aria-label", `Tasks closed per ${period.unit}`);
  chart.innerHTML = period.values.map((value, index) => `
    <div class="tp-col" role="listitem">
      <span class="tp-bar-wrap">
        ${index === period.values.length - 1 ? `<b class="tp-value">${value}</b>` : ""}
        <span class="tp-bar" style="height:${Math.round((value / max) * 85)}%" tabindex="0" data-tip="${labels[index]}: ${value} tasks" aria-label="${labels[index]}: ${value} tasks closed"></span>
      </span>
      <small>${labels[index]}</small>
    </div>`).join("");
  document.getElementById("report-throughput-total").textContent = `${closed} total`;

  const total = healthData.completed + healthData.progress + healthData.delayed;
  const segments = [
    ["success", "Completed", healthData.completed],
    ["progress", "In progress", healthData.progress],
    ["delayed", "Delayed", healthData.delayed]
  ];
  document.getElementById("report-status-total").textContent = `${total} items`;
  document.getElementById("report-status-stack").innerHTML = segments.map(([tone, label, value]) => `
    <span class="status-segment ${tone}" style="flex-grow:${value}" tabindex="0" data-tip="${label}: ${value} (${Math.round((value / total) * 100)}%)" aria-label="${label}: ${value} items"></span>`).join("");
  document.getElementById("report-status-legend").innerHTML = segments.map(([tone, label, value]) => `
    <div class="overlay-row"><span class="overlay-dot ${tone}"></span>${label}<small class="status-percent">${Math.round((value / total) * 100)}%</small><strong>${value}</strong></div>`).join("");

  const done = reportDisciplines.reduce((sum, d) => sum + d.done, 0);
  const all = reportDisciplines.reduce((sum, d) => sum + d.total, 0);
  document.getElementById("report-discipline-total").textContent = `${done}/${all}`;
  document.getElementById("report-discipline-list").innerHTML = reportDisciplines.map((d) => `
    <div class="discipline-item">
      <span class="discipline-icon">${d.icon}</span><span class="discipline-name">${d.name}</span>
      <span class="discipline-progress" role="img" aria-label="${d.done} of ${d.total} issued"><span style="width:${Math.round((d.done / d.total) * 100)}%"></span></span><span class="discipline-total"><strong>${d.done}</strong> /${d.total}</span>
    </div>`).join("");
}

document.getElementById("report-period").addEventListener("change", renderReporting);

document.getElementById("report-export").addEventListener("click", () => {
  const rows = reportProjects.map((p) => [p.name, `${p.progress}%`, p.tasks, p.rfis, p.delayed, statusLabels[p.status]]);
  downloadText("atelier-project-health.csv", toCsv([["Project", "Progress", "Tasks", "RFIs", "Delayed", "Status"], ...rows]));
});

/* PROFILE & SETTINGS */
function loadStored(key, fallback) {
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(key) || "{}") };
  } catch {
    return { ...fallback };
  }
}

function store(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

const profileDefaults = {
  name: "Apurva Bhadange",
  email: "apurva.bhadange@lodhagroup.com",
  phone: "",
  department: "MEP Design",
  location: "South Mumbai",
  manager: "",
  bio: ""
};
const profileState = loadStored("atelier-profile", profileDefaults);
const profileForm = document.getElementById("profile-form");

// Name, initials and department appear in the topbar, profile card, greeting and notes dialog
function applyProfile() {
  const initials = initialsOf(profileState.name);
  document.querySelector(".user-name").textContent = profileState.name;
  document.querySelector(".profile-trigger").textContent = initials;
  document.querySelector(".profile-card .profile-avatar").textContent = initials;
  document.querySelector(".profile-head strong").textContent = profileState.name;
  document.querySelector(".profile-card .profile-role").textContent = profileState.department;
  document.querySelector(".profile-card .profile-email").textContent = profileState.email;
  document.querySelector(".greeting-text h1").textContent = `Good Morning, ${firstName(profileState.name)} !`;
  document.querySelector(".notes-meta p span").textContent = profileState.name;
  document.getElementById("profile-page-avatar").textContent = initials;
  document.getElementById("profile-page-name").textContent = profileState.name;
  document.getElementById("profile-page-role").textContent = `${profileState.department} · ${currentRole.textContent}`;
  document.getElementById("profile-page-email").textContent = profileState.email;
  document.querySelector("[data-sign-in]").textContent = `Continue as ${profileState.name}`;
}

function fillProfileForm() {
  Object.entries(profileState).forEach(([key, value]) => {
    const field = profileForm.elements[key];
    if (field) field.value = value;
  });
}

function setProfileTab(tab) {
  const labels = { account: "Profile", notifications: "Notification Preferences", help: "Help & Support" };
  if (!labels[tab]) tab = "account";
  document.querySelectorAll("[data-profile-tab]").forEach((button) => {
    const isActive = button.dataset.profileTab === tab;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-profile-panel]").forEach((panel) => { panel.hidden = panel.dataset.profilePanel !== tab; });
  if (tab === "account") fillProfileForm();
  renderBreadcrumb([{ label: "Account", route: "profile/account" }, { label: labels[tab] }]);
  syncHash(`profile/${tab}`);
}

function showProfile(tab) {
  showPage("profile");
  setProfileTab(tab);
}

document.querySelectorAll("[data-profile-tab]").forEach((button) => {
  button.addEventListener("click", () => setProfileTab(button.dataset.profileTab));
});

profileForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!profileForm.reportValidity()) return;
  Object.keys(profileDefaults).forEach((key) => { profileState[key] = profileForm.elements[key].value.trim(); });
  store("atelier-profile", profileState);
  applyProfile();
  showToast("Profile saved.");
});

document.querySelector("[data-profile-reset]").addEventListener("click", fillProfileForm);
roleSwitchMenu.addEventListener("click", () => applyProfile());

const prefEvents = [
  ["task-assigned", "Task assigned to me", true],
  ["task-due", "Task due or overdue", true],
  ["rfi-raised", "New RFI on my projects", true],
  ["rfi-response", "Response on an RFI I raised", true],
  ["deliverable", "Deliverable status changes", false],
  ["meeting", "Meeting reminders", true],
  ["mention", "Mentions and comments", false]
];
const prefDefaults = Object.fromEntries(prefEvents.flatMap(([key, , email]) => [[`${key}-app`, true], [`${key}-email`, email]]));
const prefState = loadStored("atelier-notification-prefs", { ...prefDefaults, digest: "08:00" });
const prefForm = document.getElementById("pref-form");

function renderPrefs() {
  const toggle = (name, label) => `
    <label class="pref-switch">
      <input type="checkbox" name="${name}"${prefState[name] ? " checked" : ""}>
      <span class="pref-switch-track" aria-hidden="true"></span>
      <span class="visually-hidden">${label}</span>
    </label>`;
  document.getElementById("pref-rows").innerHTML = prefEvents.map(([key, label]) => `
    <tr>
      <td><strong>${label}</strong></td>
      <td>${toggle(`${key}-app`, `${label} in-app`)}</td>
      <td>${toggle(`${key}-email`, `${label} by email`)}</td>
    </tr>`).join("");
  prefForm.elements.digest.value = prefState.digest;
}

prefForm.addEventListener("submit", (e) => {
  e.preventDefault();
  Object.keys(prefDefaults).forEach((name) => { prefState[name] = prefForm.elements[name].checked; });
  prefState.digest = prefForm.elements.digest.value;
  store("atelier-notification-prefs", prefState);
  showToast("Notification preferences saved.");
});

document.getElementById("help-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.reportValidity()) return;
  showToast(`Support request "${form.elements.subject.value.trim()}" sent. We'll reply by email.`);
  form.reset();
});

/* FOCUS MODE */
const focusItems = [
  { id: "f1", type: "Task", title: "Review Plumbing Schematics", where: "Lodha One • Wing 25", detail: "Plumbing · Assigned by Apurva Bhadange", due: "Overdue", dueCls: "overdue", action: "done", route: "open-items/tasks", state: "pending" },
  { id: "f2", type: "RFI", title: "MCB Rating Clarification", where: "Wing 25 · Electrical", detail: "Raised by Sachin Patil · 2 files · Blocking", due: "Blocking", dueCls: "overdue", action: "respond", route: "open-items/rfis", state: "pending" },
  { id: "f3", type: "Task", title: "Approved Revised Typical Floor1", where: "Lodha One • Wing 25", detail: "Coordinated · Assigned by Apurva Bhadange", due: "Due Today", dueCls: "due-today", action: "done", route: "open-items/tasks", state: "pending" },
  { id: "f4", type: "Deliverable", title: "Issue Fire Tender Package", where: "Lodha One • Tower B", detail: "Fire · Waiting on MEP Consultant", due: "Overdue", dueCls: "overdue", action: "remind", route: "open-items/deliverables", state: "pending" }
];
const focusActionLabels = { done: "Mark Done", respond: "Respond", remind: "Send Reminder" };

function updateFocusCounts() {
  const pending = focusItems.filter((item) => item.state !== "done").length;
  const label = `${pending} Pending Decision${pending === 1 ? "" : "s"}`;
  document.getElementById("focus-pending-tag").textContent = label;
  document.getElementById("focus-hero-tag").textContent = label;
  document.getElementById("focus-progress-bar").style.width = `${Math.round(((focusItems.length - pending) / focusItems.length) * 100)}%`;
  const pill = document.querySelector('.rail-mini-item[data-route="focus"] .rail-mini-pill');
  if (pill) pill.textContent = `${pending} pending`;
}

function renderFocus() {
  const order = { pending: 0, snoozed: 1, done: 2 };
  const items = [...focusItems].sort((a, b) => order[a.state] - order[b.state]);
  const remaining = items.filter((item) => item.state !== "done");

  document.getElementById("focus-list").innerHTML = (remaining.length ? "" : `
    <section class="overview-panel focus-empty">
      <h2>All clear</h2>
      <p>Nothing is waiting on you right now. New decisions will show up here.</p>
      <button class="project-task-add" type="button" data-route="dashboard">Back to dashboard</button>
    </section>`) + items.map((item) => `
    <article class="overview-panel focus-item${item.state === "done" ? " is-done" : ""}${item.state === "snoozed" ? " is-snoozed" : ""}" data-focus-id="${item.id}">
      <header class="focus-item-head">
        <span class="upload-type">${item.type}</span>
        <span class="status ${item.dueCls}">${item.state === "done" ? "Cleared" : item.state === "snoozed" ? "Snoozed" : item.due}</span>
      </header>
      <strong class="focus-item-title">${escapeHtml(item.title)}</strong>
      <p class="focus-item-meta">${escapeHtml(item.where)} · ${escapeHtml(item.detail)}</p>
      ${item.state === "done" ? "" : `
      <div class="focus-item-actions">
        <button class="project-task-add" type="button" data-focus-action="${item.action}">${focusActionLabels[item.action]}</button>
        ${item.state === "pending" ? '<button class="comment-btn" type="button" data-focus-action="snooze">Snooze</button>' : ""}
        <button class="comment-btn" type="button" data-route="${item.route}">Open</button>
      </div>`}
    </article>`).join("");
  updateFocusCounts();
}

function showFocus() {
  showPage("focus");
  renderFocus();
  renderBreadcrumb([{ label: "Dashboard", view: "dashboard" }, { label: "Focus mode" }]);
  syncHash("focus");
}

function clearFocusItem(item, message) {
  item.state = "done";
  renderFocus();
  showToast(message);
}

document.getElementById("focus-list").addEventListener("click", (e) => {
  const button = e.target.closest("[data-focus-action]");
  if (!button) return;
  const item = focusItems.find((entry) => entry.id === button.closest("[data-focus-id]").dataset.focusId);
  const action = button.dataset.focusAction;

  if (action === "snooze") {
    item.state = "snoozed";
    renderFocus();
    showToast(`Snoozed "${item.title}" to the end of your queue.`);
  } else if (action === "done") {
    clearFocusItem(item, `"${item.title}" marked done.`);
  } else if (action === "respond") {
    openActionDialog({
      title: "Respond to RFI",
      subtitle: item.title,
      fields: [{ name: "response", label: "Response", type: "textarea", required: true, placeholder: "Clarification or the revised detail reference..." }],
      submitLabel: "Send Response",
      onSubmit() { clearFocusItem(item, `Response sent on "${item.title}".`); }
    });
  } else if (action === "remind") {
    openActionDialog({
      title: "Send reminder",
      subtitle: item.title,
      fields: [{ name: "message", label: "Message", type: "textarea", required: true, value: `Hi, a quick nudge on "${item.title}" — it's overdue. Could you share an update?` }],
      submitLabel: "Send Reminder",
      onSubmit() { clearFocusItem(item, "Reminder sent."); }
    });
  }
});

/* MEETINGS PAGE + MOM TRACKER */
let meetingTypeFilter = "all";
let momStatusFilter = "all";
const meetingsSearch = document.getElementById("meetings-search");
const momSearch = document.getElementById("mom-search");

function dayLabel(date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return date.toLocaleDateString("en-GB", { weekday: "long" });
}

function renderMeetingsPage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const query = meetingsSearch.value.trim().toLocaleLowerCase();
  const visible = meetings
    .filter((m) => m.end >= startOfToday
      && (meetingTypeFilter === "all" || m.type === meetingTypeFilter)
      && `${m.title} ${m.place} ${m.project}`.toLocaleLowerCase().includes(query))
    .sort((a, b) => a.start - b.start);

  const days = new Map();
  visible.forEach((m) => {
    const key = m.start.toDateString();
    if (!days.has(key)) days.set(key, []);
    days.get(key).push(m);
  });

  document.getElementById("meeting-days").innerHTML = days.size
    ? Array.from(days.values(), (list) => `
      <section class="meeting-day">
        <h2 class="meeting-day-title">${dayLabel(list[0].start)} <span>${list[0].start.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span></h2>
        <div class="meeting-grid">${list.map(createMeetingCard).join("")}</div>
      </section>`).join("")
    : '<p class="schedule-empty">No meetings match these filters.</p>';
}

const momEntries = [
  { id: "mom1", subject: "Elanor Coordination Meeting", date: iso(7), recordedBy: "Apurva Bhadange", text: "Agreed riser shaft sizes for Tower 26.\nSachin to issue revised shaft layout by Friday.\nConsultant to confirm chiller weights.", status: "shared" },
  { id: "mom2", subject: "MEP Design Review", date: iso(5), recordedBy: "Sachin Patil", text: "Reviewed basement ventilation strategy.\nApproved jet fan layout for B1 and B2.\nNeha to follow up on fire damper schedule.\nRohit to share site photos of UGT 2.", status: "shared" },
  { id: "mom3", subject: "Fire Strategy Call", date: iso(2), recordedBy: "Apurva Bhadange", text: "Authority comments on refuge floor discussed.\nVerdant to send revised fire strategy report.", status: "draft" }
];
let editingMomId = null;
const actionItemPattern = /\b(to|will)\s+(issue|send|share|confirm|follow|review|update|submit|prepare|check)|follow[- ]?up|action:|owner:/i;
const countActionItems = (text) => text.split(/\n+/).filter((line) => actionItemPattern.test(line)).length;

function renderMom() {
  const query = momSearch.value.trim().toLocaleLowerCase();
  const visible = momEntries
    .filter((entry) => (momStatusFilter === "all" || entry.status === momStatusFilter)
      && `${entry.subject} ${entry.recordedBy} ${entry.text}`.toLocaleLowerCase().includes(query))
    .sort((a, b) => b.date.localeCompare(a.date));

  document.getElementById("mom-rows").innerHTML = visible.length
    ? visible.map((entry) => `
      <tr class="project-task-row">
        <td><strong>${escapeHtml(entry.subject)}</strong><span class="row-subtitle">${escapeHtml(entry.text.split("\n")[0] || "No notes yet")}</span></td>
        <td>${formatLongDate(entry.date)}</td>
        <td>${escapeHtml(entry.recordedBy)}</td>
        <td>${countActionItems(entry.text)}</td>
        <td><span class="task-state ${entry.status === "shared" ? "completed" : "pending"}">${entry.status === "shared" ? "Shared" : "Draft"}</span></td>
        <td><button class="comment-btn" type="button" data-mom-edit="${entry.id}">Edit</button></td>
      </tr>`).join("")
    : '<tr><td colspan="6" class="drawer-empty mom-empty">No minutes match these filters.</td></tr>';
}

function setMeetingsTab(tab) {
  if (tab !== "mom") tab = "schedule";
  document.querySelectorAll("[data-meetings-tab]").forEach((button) => {
    const isActive = button.dataset.meetingsTab === tab;
    button.classList.toggle("active", isActive);
    if (isActive) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  document.querySelectorAll("[data-meetings-panel]").forEach((panel) => { panel.hidden = panel.dataset.meetingsPanel !== tab; });
  if (tab === "mom") renderMom();
  else renderMeetingsPage();
  renderBreadcrumb([{ label: "Dashboard", view: "dashboard" }, { label: "Meetings", route: "meetings" }, { label: tab === "mom" ? "MOM Tracker" : "Schedule" }]);
  syncHash(tab === "mom" ? "meetings/mom" : "meetings");
}

function showMeetings(tab) {
  showPage("meetings");
  setMeetingsTab(tab);
}

document.querySelectorAll("[data-meetings-tab]").forEach((button) => {
  button.addEventListener("click", () => setMeetingsTab(button.dataset.meetingsTab));
});

document.querySelectorAll("[data-meeting-type]").forEach((chip) => {
  chip.addEventListener("click", () => {
    meetingTypeFilter = chip.dataset.meetingType;
    document.querySelectorAll("[data-meeting-type]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderMeetingsPage();
  });
});

document.querySelectorAll("[data-mom-status]").forEach((chip) => {
  chip.addEventListener("click", () => {
    momStatusFilter = chip.dataset.momStatus;
    document.querySelectorAll("[data-mom-status]").forEach((c) => {
      c.classList.toggle("is-active", c === chip);
      c.setAttribute("aria-pressed", String(c === chip));
    });
    renderMom();
  });
});

meetingsSearch.addEventListener("input", renderMeetingsPage);
momSearch.addEventListener("input", renderMom);

// Join / MOM Tracker on any meeting card (rail, rail overlay, meetings page)
document.addEventListener("click", (e) => {
  const button = e.target.closest('.meeting-card [data-action="join"], .meeting-card [data-action="mom"]');
  if (!button) return;
  const meeting = meetings.find((m) => m.id === button.closest(".meeting-card").dataset.meetingId);
  if (!meeting) return;

  if (button.dataset.action === "mom") {
    momSearch.value = meeting.title;
    showMeetings("mom");
    return;
  }

  meeting.joined = true;
  renderSchedule();
  showToast(meeting.type === "online"
    ? `Joining "${meeting.title}" on Teams…`
    : `Marked as attending "${meeting.title}" at ${meeting.place}.`);
});

/* MINUTES OF MEETING DIALOG */
const notesForm = document.getElementById("notes-form");
const notesText = document.getElementById("notes-text");
const notesCount = document.getElementById("notes-count");
const notesRecording = document.getElementById("notes-recording");
const notesNotify = document.getElementById("notes-notify");

function updateNotesCount() {
  notesCount.textContent = `${notesText.value.length} character${notesText.value.length === 1 ? "" : "s"}`;
}

// Opening notes for a meeting picks up minutes already saved for it
function loadMomIntoNotes() {
  const entry = momEntries.find((m) => m.subject === notesSubjectInput.value && m.date === notesDateInput.value);
  editingMomId = entry?.id || null;
  notesText.value = entry?.text || "";
  notesNotify.checked = false;
  updateNotesCount();
}

function openMomEntry(id) {
  const entry = momEntries.find((m) => m.id === id);
  notesDialogReturnFocus = document.activeElement;
  notesSubjectInput.value = entry.subject;
  notesDateInput.value = entry.date;
  loadMomIntoNotes();
  notesDialogBackdrop.hidden = false;
  document.body.classList.add("project-dialog-open");
  notesText.focus();
}

document.getElementById("mom-rows").addEventListener("click", (e) => {
  const button = e.target.closest("[data-mom-edit]");
  if (button) openMomEntry(button.dataset.momEdit);
});

notesText.addEventListener("input", updateNotesCount);

document.querySelector("[data-pick-recording]").addEventListener("click", () => notesRecording.click());
notesRecording.addEventListener("change", () => {
  const file = notesRecording.files[0];
  if (!file) return;
  document.querySelector(".notes-option-label").textContent = file.name;
  showToast(`${file.name} attached to these minutes.`);
});

// Local summary of the typed notes: key points, decisions and action items
function summarizeNotes(text) {
  const body = text.split(/\n*— Summary —/)[0].trim();
  const sentences = body
    .split(/\n+|(?<=[.!?])\s+/)
    .map((line) => line.replace(/^[\s\-•*\d.)]+/, "").trim())
    .filter((line) => line.length > 3);
  const decisions = sentences.filter((line) => /\b(agreed|decided|approved|confirmed|finali[sz]ed)\b/i.test(line));
  const actions = sentences.filter((line) => !decisions.includes(line) && actionItemPattern.test(line));
  const points = sentences.filter((line) => !decisions.includes(line) && !actions.includes(line)).slice(0, 4);
  const section = (title, lines) => (lines.length ? `\n${title}:\n${lines.map((line) => `• ${line}`).join("\n")}` : "");
  return { body, summary: `${section("Key points", points)}${section("Decisions", decisions)}${section("Action items", actions)}`.trim() };
}

document.querySelector("[data-summarize-notes]").addEventListener("click", () => {
  if (notesText.value.trim().length < 20) {
    showToast("Add a few lines of notes first, then summarise.");
    notesText.focus();
    return;
  }
  const { body, summary } = summarizeNotes(notesText.value);
  notesText.value = `${body}\n\n— Summary —\n${summary}`;
  updateNotesCount();
  showToast("Summary added below your notes.");
});

notesForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const subject = notesSubjectInput.value.trim() || "Untitled meeting";
  const date = notesDateInput.value || toDateInput(new Date());
  const text = notesText.value.trim();
  const existing = momEntries.find((m) => m.id === editingMomId) || momEntries.find((m) => m.subject === subject && m.date === date);

  if (existing) {
    Object.assign(existing, { subject, date, text, status: notesNotify.checked ? "shared" : existing.status });
  } else {
    momEntries.push({ id: `mom${momEntries.length + 1}`, subject, date, recordedBy: profileState.name, text, status: notesNotify.checked ? "shared" : "draft" });
  }

  closeNotesDialog();
  if (!meetingsView.hidden) renderMom();
  showToast(notesNotify.checked ? "Minutes saved and shared with participants." : "Minutes saved as a draft in the MOM Tracker.");
});

/* NOTIFICATIONS */
const notifTrigger = document.querySelector(".notif-trigger");
const notifOverlay = document.getElementById("notif-overlay");
const notifList = document.getElementById("notif-list");

const notifications = [
  { id: "n1", who: "Sachin Patil", time: "5 min ago", title: "RFI-209 is now blocking", body: "MCB rating clarification is holding the Wing 25 electrical package.", project: "Lodha Belmondo", route: "project/rfis", unread: true },
  { id: "n2", who: "Sanjay Rao", time: "40 min ago", title: "Uploaded Fire_Strategy_NOC_Approval_Letter.pdf", body: "The fire NOC approval letter is in the project files.", project: "Lodha Belmondo", route: "project/files", unread: true },
  { id: "n3", who: "Priya Shah", time: "2 hr ago", title: "Assigned you T-13", body: "Approved Revised Typical Floor1 is due today.", project: "Lodha One", route: "open-items/tasks", unread: true },
  { id: "n4", who: "Neha Kapoor", time: "Yesterday", title: "MEP Design Review rescheduled", body: "The new time is on your schedule.", project: "Lodha One", route: "meetings", unread: false },
  { id: "n5", who: "Rohit Patil", time: "Yesterday", title: "Closed RFI-211", body: "Issue Revise Infra Fire Layout was answered and closed.", project: "Palava", route: "open-items/rfis", unread: false }
];

function renderNotifications() {
  const unread = notifications.filter((n) => n.unread).length;
  document.getElementById("notif-badge").hidden = unread === 0;
  notifTrigger.setAttribute("aria-label", unread ? `Notifications, ${unread} unread` : "Notifications");
  document.getElementById("notif-title").textContent = unread ? `${unread} unread` : "All caught up";
  notifList.innerHTML = notifications.map((n) => `
    <li class="mail-item notif-item${n.unread ? " is-unread" : ""}" data-notif-id="${n.id}" tabindex="0" role="link">
      <span class="mail-avatar">${initialsOf(n.who)}</span>
      <div class="mail-item-head">
        <strong class="mail-sender">${n.who}</strong>
        <span class="mail-time">${n.time}</span>
      </div>
      <div class="mail-item-body">
        <p class="mail-subject">${escapeHtml(n.title)}</p>
        <p class="mail-preview">${escapeHtml(n.body)}</p>
        <span class="mail-project">${escapeHtml(n.project)}</span>
      </div>
    </li>`).join("");
}

function setNotifOpen(open) {
  notifOverlay.hidden = !open;
  notifTrigger.setAttribute("aria-expanded", String(open));
}

notifTrigger.addEventListener("click", () => {
  const opening = notifOverlay.hidden;
  setMailOpen(false);
  setProfileOpen(false);
  setRoleMenuOpen(false);
  setNotifOpen(opening);
});

mailTrigger.addEventListener("click", () => setNotifOpen(false));

function openNotification(item) {
  item.unread = false;
  renderNotifications();
  setNotifOpen(false);
  renderRoute(item.route);
}

notifList.addEventListener("click", (e) => {
  const item = e.target.closest("[data-notif-id]");
  if (item) openNotification(notifications.find((n) => n.id === item.dataset.notifId));
});

notifList.addEventListener("keydown", (e) => {
  const item = e.target.closest("[data-notif-id]");
  if (item && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    openNotification(notifications.find((n) => n.id === item.dataset.notifId));
  }
});

document.getElementById("notif-mark-read").addEventListener("click", () => {
  notifications.forEach((n) => { n.unread = false; });
  renderNotifications();
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".notif-menu")) setNotifOpen(false);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !notifOverlay.hidden) {
    setNotifOpen(false);
    notifTrigger.focus();
  }
});

/* AI ASSISTANT */
const assistantBackdrop = document.getElementById("assistant-backdrop");
const assistantMessages = document.getElementById("assistant-messages");
const assistantInput = document.getElementById("assistant-input");

function addAssistantMessage(text, fromUser = false) {
  const message = document.createElement("div");
  message.className = `assistant-msg${fromUser ? " is-user" : ""}`;
  message.textContent = text;
  assistantMessages.append(message);
  message.scrollIntoView({ block: "end" });
}

function openTasksMatching(selector) {
  return Array.from(dashboardTasksBody.rows)
    .filter((row) => !row.classList.contains("done") && row.querySelector(selector))
    .map((row) => `• ${row.cells[1].textContent.trim()} ${rowTitle(row)} (${row.querySelector(".cell-project").textContent.trim()})`);
}

function assistantReply(question) {
  const q = question.toLowerCase();
  if (/overdue|late|delay|behind/.test(q)) {
    const overdue = openTasksMatching(".status.overdue");
    return overdue.length ? `You have ${overdue.length} overdue task${overdue.length === 1 ? "" : "s"}:\n${overdue.join("\n")}` : "Nothing on your dashboard is overdue right now.";
  }
  if (/rfi|block/.test(q)) {
    const blocking = rfiData.filter((r) => r.blocking && r.status !== "completed");
    return `${blocking.length} RFIs are marked blocking on Lodha Belmondo:\n${blocking.map((r) => `• ${r.id} ${r.query} — ${r.discipline}, ${r.wing}`).join("\n")}\nOpen the project's RFIs tab to respond.`;
  }
  if (/meeting|schedule|call|calendar/.test(q)) {
    const next = meetings.filter((m) => m.end > Date.now()).sort((a, b) => a.start - b.start)[0];
    return next ? `Your next meeting is "${next.title}" at ${formatTime(next.start)} (${dayLabel(next.start).toLowerCase()}), ${next.place}. ${next.attendees} people are invited.` : "You have no upcoming meetings.";
  }
  if (/deliverable|document|drawing/.test(q)) {
    const pending = Array.from(deliverablesBody.rows).filter((row) => !row.classList.contains("done"));
    return `${pending.length} deliverables are still open on your dashboard:\n${pending.map((row) => `• ${rowTitle(row)} — ${rowDueStatus(row)?.textContent.trim() || "no due date"}`).join("\n")}`;
  }
  if (/summar|day|today|focus|priorit/.test(q)) {
    const urgent = openTasksMatching(".status.overdue, .status.due-today").length;
    const todayMeetings = meetings.filter((m) => isToday(m.start) && m.end > Date.now());
    const pending = focusItems.filter((item) => item.state !== "done").length;
    return `Here's your day:\n• ${urgent} urgent task${urgent === 1 ? "" : "s"} due today or overdue\n• ${todayMeetings.length} meeting${todayMeetings.length === 1 ? "" : "s"} still to come${todayMeetings[0] ? `, next at ${formatTime(todayMeetings[0].start)}` : ""}\n• ${pending} decision${pending === 1 ? "" : "s"} waiting in focus mode`;
  }
  return "I can answer questions about your tasks, RFIs, deliverables and meetings. Try \"What's overdue?\" or \"When is my next meeting?\"";
}

function askAssistant(question) {
  if (!question.trim()) return;
  addAssistantMessage(question, true);
  window.setTimeout(() => addAssistantMessage(assistantReply(question)), 250);
}

function openAssistant() {
  assistantBackdrop.hidden = false;
  if (!assistantMessages.children.length) {
    addAssistantMessage(`Hi ${firstName(profileState.name)}, I can look across your dashboard, projects and schedule. What do you need?`);
  }
  assistantInput.focus();
}

function closeAssistant() {
  assistantBackdrop.hidden = true;
}

document.querySelector("[data-open-assistant]").addEventListener("click", openAssistant);

assistantBackdrop.addEventListener("click", (e) => {
  if (e.target === assistantBackdrop || e.target.closest("[data-close-assistant]")) closeAssistant();
  const prompt = e.target.closest("[data-assistant-prompt]");
  if (prompt) askAssistant(prompt.dataset.assistantPrompt);
});

document.getElementById("assistant-form").addEventListener("submit", (e) => {
  e.preventDefault();
  askAssistant(assistantInput.value);
  assistantInput.value = "";
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !assistantBackdrop.hidden) closeAssistant();
});

/* TASK DRAWER: more options menu */
const drawerMoreBtn = document.querySelector(".drawer-more-btn");
const drawerMoreMenu = document.getElementById("drawer-more-menu");

function setDrawerMenuOpen(open) {
  drawerMoreMenu.hidden = !open;
  drawerMoreBtn.setAttribute("aria-expanded", String(open));
}

drawerMoreBtn.addEventListener("click", () => setDrawerMenuOpen(drawerMoreMenu.hidden));

document.addEventListener("click", (e) => {
  if (!e.target.closest(".drawer-more-wrap")) setDrawerMenuOpen(false);
});

function refreshTaskLists() {
  updateTaskCount();
  updateProjectTaskCounts();
  filterProjectTasks();
}

drawerMoreMenu.addEventListener("click", (e) => {
  const item = e.target.closest("[data-drawer-action]");
  if (!item || !activeTaskRow) return;
  setDrawerMenuOpen(false);
  const row = activeTaskRow;
  const id = row.cells[1].textContent.trim();
  const title = rowTitle(row);

  if (item.dataset.drawerAction === "copy") {
    navigator.clipboard?.writeText(id)
      .then(() => showToast(`Copied ${id}.`))
      .catch(() => showToast(`Task ID: ${id}`));
    return;
  }

  if (item.dataset.drawerAction === "duplicate") {
    const copy = {
      title: `${title} (copy)`,
      description: row.dataset.description || "",
      priority: drawerPriority.dataset.value,
      discipline: drawerDiscipline.value,
      targetDate: drawerDueDate.value,
      assignee: row.cells[6].textContent.trim()
    };
    if (row.matches("[data-task-row]")) addProjectTask(copy);
    else if (row.matches("[data-oi-row]")) addOpenItemsTask(copy);
    else addDashboardTask(copy);
    closeDrawer();
    showToast(`Duplicated ${id}.`);
    return;
  }

  openActionDialog({
    title: `Delete ${id}?`,
    subtitle: title,
    body: '<p class="action-dialog-text">The task, its comments and attachments will be removed for everyone on the project.</p>',
    submitLabel: "Delete Task",
    onSubmit() {
      if (row.matches("[data-oi-row]")) {
        openItemsConfig.tasks.rows.splice(Number(row.dataset.oiIndex), 1);
        buildOpenItemsPanel("tasks");
      } else {
        row.remove();
      }
      refreshTaskLists();
      closeDrawer();
      showToast(`${id} deleted.`);
    }
  });
});

/* LOG OUT */
const signedOutScreen = document.getElementById("signed-out-screen");

document.addEventListener("click", (e) => {
  const trigger = e.target.closest('[data-action="logout"]');
  if (!trigger) return;
  e.preventDefault();
  setProfileOpen(false);
  openActionDialog({
    title: "Log out of Atelier?",
    body: "<p class=\"action-dialog-text\">You'll need to sign in again to see your projects. Anything unsaved in an open form will be lost.</p>",
    submitLabel: "Log Out",
    onSubmit() {
      signedOutScreen.hidden = false;
      signedOutScreen.querySelector("[data-sign-in]").focus();
    }
  });
});

signedOutScreen.querySelector("[data-sign-in]").addEventListener("click", () => {
  signedOutScreen.hidden = true;
  showToast(`Welcome back, ${firstName(profileState.name)}.`);
});

/* DETAILS DRAWER: RFIs, deliverables and transmittals (same layout as the task drawer) */
const recordBackdrop = document.getElementById("record-drawer-backdrop");
const recordBody = document.getElementById("record-drawer-body");
const recordAttachmentInput = document.getElementById("record-attachment-input");
const dashboardRecords = new WeakMap(); // rows that only exist in the HTML get a record the first time they open
let recordCtx = null;

const recordSelect = (name, options, value) => `
  <span class="drawer-control">
    <select data-record-field="${name}" aria-label="${name}">
      ${(value && !options.includes(value) ? [value, ...options] : options).map((option) => `<option${option === value ? " selected" : ""}>${escapeHtml(option)}</option>`).join("")}
    </select>
    <span class="drawer-chevron" aria-hidden="true"></span>
  </span>`;
const recordReadonly = (value) => `<span class="drawer-control drawer-readonly">${escapeHtml(value || "—")}</span>`;
const recordDetail = (label, control) => `<div class="drawer-detail"><span>${label}</span>${control}</div>`;

function recordChips(items, emptyText) {
  return items.length
    ? items.map((item) => `<div class="drawer-item-chip"><span>${escapeHtml(item)}</span></div>`).join("")
    : `<p class="drawer-empty">${emptyText}</p>`;
}

function recordThread(thread, emptyText) {
  return thread.length
    ? thread.map((entry) => `<div class="drawer-comment"><strong>${escapeHtml(entry.by)}</strong> <small>${escapeHtml(entry.when)}</small><p>${escapeHtml(entry.text)}</p></div>`).join("")
    : `<p class="drawer-empty">${emptyText}</p>`;
}

function recordSections(data, { threadTitle = "Comments", threadEmpty = "No comments yet.", placeholder = "Add a comment..." } = {}) {
  return `
    <section class="drawer-section">
      <h4>Attachments</h4>
      <div class="drawer-item-list">${recordChips(data.attachments, "No attachments.")}</div>
      <button class="drawer-add-action" type="button" data-record-attach>+ Add attachment</button>
    </section>
    <section class="drawer-section">
      <h4>${threadTitle}</h4>
      <div class="drawer-comments">${recordThread(data.thread, threadEmpty)}</div>
      <form class="drawer-comment-form" data-record-thread>
        <input type="text" placeholder="${placeholder}" aria-label="${placeholder}" autocomplete="off">
        <button type="submit" aria-label="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </form>
    </section>
    <section class="drawer-section">
      <h4>Activity</h4>
      <div class="drawer-activity-list">${data.activity.map((entry) => `<p class="drawer-activity-item">${escapeHtml(entry)}</p>`).join("")}</div>
    </section>`;
}

const recordFooter = document.getElementById("record-drawer-footer");
const defaultRecordFooter = recordFooter.innerHTML;

function openRecordDrawer(ctx) {
  recordCtx = ctx;
  document.getElementById("record-drawer-heading").textContent = ctx.heading;
  recordBody.innerHTML = ctx.render();
  recordFooter.innerHTML = ctx.footer ? ctx.footer() : defaultRecordFooter;
  enhanceDateInputs(recordBody);
  recordBody.scrollTop = 0;
  recordBackdrop.hidden = false;
  document.body.classList.add("project-dialog-open");
  recordBackdrop.querySelector(".drawer-close").focus();
}

function rerenderRecordDrawer() {
  const scroll = recordBody.scrollTop;
  recordBody.innerHTML = recordCtx.render();
  recordFooter.innerHTML = recordCtx.footer ? recordCtx.footer() : defaultRecordFooter;
  enhanceDateInputs(recordBody);
  recordBody.scrollTop = scroll;
}

function closeRecordDrawer() {
  if (recordBackdrop.hidden) return;
  recordBackdrop.hidden = true;
  recordCtx = null;
  if (actionBackdrop.hidden) document.body.classList.remove("project-dialog-open");
}

/* RFI details */
function rfiDataForRow(row) {
  if (row.dataset.rfiIndex !== undefined) return rfiData[Number(row.dataset.rfiIndex)];
  if (row.matches("[data-oi-row]")) return openItemsConfig.rfis.rows[Number(row.dataset.oiIndex)];
  if (!dashboardRecords.has(row)) {
    const cells = Array.from(row.cells, (cell) => cell.textContent.trim());
    dashboardRecords.set(row, {
      id: cells[0], query: rowTitle(row), wing: cells[2], impact: cells[3], discipline: cells[4], by: cells[5],
      blocking: Boolean(row.querySelector(".badge.blocking")), received: "2h ago", files: 2
    });
  }
  return dashboardRecords.get(row);
}

function openRfiDrawer(row) {
  const data = rfiDataForRow(row);
  const closed = () => data.status === "completed" || data.group === "completed";
  data.attachments ||= Array.from({ length: data.files || 0 }, (_, i) => `${data.id}_markup_${i + 1}.pdf`);
  data.thread ||= [];
  data.activity ||= [`Raised by ${data.by}${data.received ? ` · ${data.received}` : ""}`];

  openRecordDrawer({
    data,
    heading: "RFI Details",
    render() {
      const status = closed() ? "Closed" : data.answered ? "Answered" : "Open";
      return `
        <p class="drawer-meta">${escapeHtml(data.id)} · ${escapeHtml(data.wing)} · Raised by ${escapeHtml(data.by)}</p>
        <h3 class="drawer-title">${escapeHtml(data.query)} ${data.blocking && !closed() ? '<span class="badge blocking">Blocking</span>' : ""}</h3>
        <p class="drawer-description">${escapeHtml(data.description || `Clarification requested for ${data.wing}: ${data.query}.${data.blocking ? " Work on this package is on hold until it's answered." : ""}`)}</p>
        <div class="drawer-detail-grid">
          ${recordDetail("Status", recordSelect("status", ["Open", "Answered", "Closed"], status))}
          ${recordDetail("Impact", recordSelect("impact", ["None", "Cost", "Time", "Cost & Time"], data.impact))}
          ${recordDetail("Discipline", recordSelect("discipline", ["Electrical", "Plumbing", "HVAC", "Firefighting"], data.discipline || data.disc))}
          ${recordDetail("Received", recordReadonly(data.received || "—"))}
        </div>
        ${recordSections(data, { threadTitle: "Responses", threadEmpty: "No responses yet.", placeholder: "Write a response..." })}`;
    },
    onThread() {
      data.answered = true;
      return `Response posted by ${profileState.name}`;
    },
    save(values) {
      const changes = [];
      if (values.impact !== data.impact) changes.push(`Impact changed to ${values.impact}`);
      if (values.discipline !== (data.discipline || data.disc)) changes.push(`Discipline changed to ${values.discipline}`);
      data.impact = values.impact;
      if ("disc" in data) data.disc = values.discipline;
      else data.discipline = values.discipline;
      data.answered = values.status !== "Open";
      if (changes.length) data.activity.push(changes.join(" · "));

      if (values.status === "Closed" && !closed()) {
        data.activity.push(`Closed by ${profileState.name}`);
        closeRfi(row);
        return `${data.id} closed.`;
      }
      if (row.dataset.rfiIndex !== undefined) renderRfis();
      else if (row.matches("[data-oi-row]")) buildOpenItemsPanel("rfis");
      else {
        row.cells[3].textContent = values.impact;
        row.cells[4].textContent = values.discipline;
      }
      return `${data.id} updated.`;
    }
  });
}

/* Deliverable details */
function deliverableDataForRow(row) {
  if (row.dataset.trackerIndex !== undefined) return { source: "tracker", data: deliverableTracker[Number(row.dataset.trackerIndex)] };
  if (row.matches("[data-oi-row]")) return { source: "open-items", data: openItemsConfig.deliverables.rows[Number(row.dataset.oiIndex)] };
  if (!dashboardRecords.has(row)) {
    dashboardRecords.set(row, {
      title: rowTitle(row),
      project: row.cells[2].textContent.trim(),
      status: row.querySelector(".task-state")?.textContent.trim() || "Not Started",
      dueLabel: rowDueStatus(row)?.textContent.trim() || "",
      waiting: row.querySelector(".waiting-tag")?.textContent.replace(/^[\s\S]*Waiting on\s*/i, "").trim(),
      priority: rowPriorityBadge(row)?.textContent.trim()
    });
  }
  return { source: "dashboard", data: dashboardRecords.get(row) };
}

function openDeliverableDrawer(row) {
  const { source, data } = deliverableDataForRow(row);
  const inTracker = source === "tracker";
  const status = () => data.status || data.stateLabel || "Not Started";
  data.attachments ||= inTracker && data.status !== "Not Started" ? [`${data.docNo}_${data.stage.replace(/\s+/g, "")}.pdf`] : [];
  data.thread ||= [];
  data.activity ||= [inTracker ? `Added to tracker · owner ${data.owner || "unassigned"}` : "Deliverable created"];

  openRecordDrawer({
    data,
    heading: "Deliverable Details",
    render() {
      const meta = inTracker
        ? `${data.docNo} · ${data.tower} · ${data.floor}`
        : `${data.project || ""}${data.sub ? ` · ${data.sub}` : ""}`;
      const dueValue = data.due && /^\d{4}-/.test(data.due) ? data.due : "";
      const grid = inTracker
        ? `
          ${recordDetail("Status", recordSelect("status", trackerStatuses, status()))}
          ${recordDetail("Due date", `<span class="drawer-control date-control"><input type="date" data-record-field="due" value="${dueValue}" aria-label="Due date"></span>`)}
          ${recordDetail("Stage", recordSelect("stage", uniqueOptions(trackerStages, "stage"), data.stage))}
          ${recordDetail("Department", recordSelect("department", uniqueOptions(trackerDepartments, "department"), data.department))}
          ${recordDetail("Tower", recordSelect("tower", uniqueOptions(trackerTowers, "tower"), data.tower))}
          ${recordDetail("Floor", recordSelect("floor", uniqueOptions(trackerFloors, "floor").sort(trackerGroupSort("floor")), data.floor))}
          ${recordDetail("Owner", recordSelect("owner", teamMembers.filter((m) => m.group === "mep").map((m) => m.name), data.owner))}`
        : `
          ${recordDetail("Status", recordSelect("status", [...trackerStatuses, "Delayed"], status()))}
          ${recordDetail("Due date", `<span class="drawer-control date-control"><input type="date" data-record-field="due" value="${dueValue}" aria-label="Due date"></span>`)}
          ${recordDetail("Currently", recordReadonly(data.dueLabel || "—"))}
          ${recordDetail("Priority", recordReadonly(data.priority))}`;
      return `
        <p class="drawer-meta">${escapeHtml(meta)}</p>
        <h3 class="drawer-title">${escapeHtml(data.title.replace(/<[^>]+>/g, ""))}</h3>
        ${data.waiting ? `<p class="drawer-description"><span class="waiting-tag">Waiting on ${escapeHtml(data.waiting.replace(/<[^>]+>/g, ""))}</span> — use Remind on the list to nudge them.</p>` : ""}
        <div class="drawer-detail-grid">${grid}</div>
        ${recordSections(data)}`;
    },
    save(values) {
      const changes = [];
      if (values.status !== status()) changes.push(`Status changed to ${values.status}`);
      if (values.due && values.due !== data.due) changes.push(`Due date set to ${formatLongDate(values.due)}`);

      if (inTracker) {
        ["stage", "department", "tower", "floor", "owner"].forEach((key) => {
          if (values[key] !== data[key]) changes.push(`${trackerFieldLabels[key]} changed to ${values[key]}`);
        });
        Object.assign(data, { status: values.status, due: values.due || data.due, stage: values.stage, department: values.department, tower: values.tower, floor: values.floor, owner: values.owner });
        if (changes.length) data.activity.push(changes.join(" · "));
        renderTracker();
        return `${data.docNo} updated.`;
      }

      const due = values.due ? dueInfo(values.due) : null;
      if (changes.length) data.activity.push(changes.join(" · "));
      if (source === "open-items") {
        data.stateLabel = values.status;
        data.state = deliverableStateClass[values.status] || "pending";
        if (due) Object.assign(data, { due: due.due, dueLabel: due.label });
        data.group = values.status === "Approved" ? "completed" : data.group === "completed" ? "pending" : data.group;
        buildOpenItemsPanel("deliverables");
      } else {
        data.status = values.status;
        const chip = row.querySelector(".task-state");
        chip.className = `task-state ${deliverableStateClass[values.status] || "pending"}`;
        chip.textContent = values.status;
        if (due) {
          data.due = values.due;
          data.dueLabel = due.label;
          const dueChip = rowDueStatus(row);
          dueChip.className = `status ${due.cls}`;
          dueChip.textContent = due.label;
        }
        const checkbox = row.querySelector(".task-checkbox");
        if (checkbox.checked !== (values.status === "Approved")) {
          checkbox.checked = values.status === "Approved";
          checkbox.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      return "Deliverable updated.";
    }
  });
}

/* Transmittal details: review drawings, confirm recipient, then approve & send */
const recordValues = () => Object.fromEntries(Array.from(recordBody.querySelectorAll("[data-record-field]"), (field) => [field.dataset.recordField, field.value]));

function applyTransmittalFields(t) {
  const values = recordValues();
  if ("recipient" in values) t.recipient = values.recipient.trim();
  if ("recipientRole" in values) t.recipientRole = values.recipientRole.trim();
  if (values.source) t.source = values.source;
  if (values.purpose) t.purpose = values.purpose;
  if ("color" in values) t.copies.color = Math.max(0, Number(values.color) || 0);
  if ("bw" in values) t.copies.bw = Math.max(0, Number(values.bw) || 0);
}

function openTransmittalDrawer(row) {
  const t = transmittals[Number(row.dataset.transmittalIndex)];
  t.activity ||= [t.origin === "ifc" ? "Drafted automatically from an IFC upload" : `Created by ${t.by}`];
  if (t.status === "sent" && !t.activity.some((entry) => entry.startsWith("Sent"))) t.activity.push(`Sent to ${t.recipient} on ${transmittalDate(t.sent)}`);
  let error = "";

  openRecordDrawer({
    data: t,
    heading: "Transmittal Details",
    render() {
      const pending = t.status === "pending";
      const defaults = transmittalDefaults(t.wing);
      const suggestions = recentRecipients().filter((name) => name !== t.recipient);
      const numberInput = (name, value, label) => `<span class="drawer-control"><input type="number" min="0" data-record-field="${name}" value="${value}" aria-label="${label}"></span>`;
      return `
        <p class="drawer-meta">${t.no} · ${escapeHtml(t.wing)} · ${t.origin === "ifc" ? `Drafted from IFC upload on ${transmittalDate(t.created)}` : `Created by ${escapeHtml(t.by)}`}</p>
        <h3 class="drawer-title">${escapeHtml(transmittalSubject(t))} <span class="tr-chip ${pending ? "is-pending" : "is-sent"}">${pending ? "Pending" : "Sent"}</span></h3>
        ${pending
          ? `<p class="drawer-description">Check the drawings and recipient, then approve to send. ${t.recipient && defaults.basis ? `Recipient filled from history — ${escapeHtml(defaults.basis.no)} went to ${escapeHtml(defaults.basis.recipient)} on ${transmittalDate(defaults.basis.sent)}.` : ""}</p>`
          : `<p class="drawer-description">Sent to ${escapeHtml(t.recipient)} on ${transmittalDate(t.sent)}.</p>`}
        ${error ? `<p class="action-error" role="alert">${escapeHtml(error)}</p>` : ""}
        <div class="drawer-detail-grid">
          ${recordDetail("Recipient", pending
            ? `<span class="drawer-control"><input type="text" data-record-field="recipient" value="${escapeHtml(t.recipient)}" placeholder="Who receives the drawings" aria-label="Recipient"></span>`
            : recordReadonly(t.recipient))}
          ${recordDetail("Source", pending ? recordSelect("source", transmittalSources, t.source) : recordReadonly(t.source))}
          ${recordDetail("Colour copies", pending ? numberInput("color", t.copies.color, "Colour copies") : recordReadonly(String(t.copies.color)))}
          ${recordDetail("B&W copies", pending ? numberInput("bw", t.copies.bw, "Black and white copies") : recordReadonly(String(t.copies.bw)))}
          ${recordDetail("Purpose", pending ? recordSelect("purpose", transmittalPurposes, t.purpose) : recordReadonly(t.purpose))}
          ${recordDetail("Recipient role", pending
            ? `<span class="drawer-control"><input type="text" data-record-field="recipientRole" value="${escapeHtml(t.recipientRole || "")}" placeholder="e.g. Site Manager" aria-label="Recipient role"></span>`
            : recordReadonly(t.recipientRole || "—"))}
        </div>
        ${pending && suggestions.length ? `
          <div class="recipient-suggestions">
            <span>Recently sent to:</span>
            ${suggestions.map((name) => `<button class="task-priority-filter" type="button" data-record-action="use-recipient" data-name="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join("")}
          </div>` : ""}
        <section class="drawer-section">
          <h4>Drawings (${t.drawings.length})</h4>
          <div class="tr-drawings">
            <table>
              <thead><tr><th>Drawing No.</th><th>Drawing Name</th><th>Rev.</th>${pending ? '<th><span class="visually-hidden">Remove</span></th>' : ""}</tr></thead>
              <tbody>
                ${t.drawings.map((drawing, index) => `
                  <tr>
                    <td>${escapeHtml(drawing.no)}</td>
                    <td>${escapeHtml(drawing.name)}</td>
                    <td><span class="upload-type">${escapeHtml(drawing.rev)}</span></td>
                    ${pending ? `<td><button class="pdf-remove" type="button" data-record-action="remove-drawing" data-index="${index}" aria-label="Remove ${escapeHtml(drawing.name)}">×</button></td>` : ""}
                  </tr>`).join("")}
              </tbody>
            </table>
          </div>
          ${pending ? '<button class="drawer-add-action" type="button" data-record-action="add-drawings">+ Add drawings from files</button>' : ""}
        </section>
        ${t.remarks ? `<section class="drawer-section"><h4>Remarks</h4><p class="drawer-comment">${escapeHtml(t.remarks)}</p></section>` : ""}
        <section class="drawer-section">
          <h4>Activity</h4>
          <div class="drawer-activity-list">${t.activity.map((entry) => `<p class="drawer-activity-item">${escapeHtml(entry)}</p>`).join("")}</div>
        </section>`;
    },
    footer() {
      const pending = t.status === "pending";
      return `
        ${pending ? '<button class="submit-project-btn drawer-save" type="button" data-record-action="approve">Approve &amp; Send</button>' : '<button class="submit-project-btn drawer-save" type="button" data-record-action="download">Download PDF</button>'}
        <div class="drawer-footer-links">
          ${pending ? '<button class="task-discard" type="button" data-record-save>Save draft</button>' : ""}
          <button class="task-discard" type="button" data-record-action="view-pdf">View PDF</button>
          <button class="task-discard" type="button" data-record-action="edit-pdf">Edit PDF</button>
          ${pending ? '<button class="task-discard" type="button" data-record-action="download">Download PDF</button>' : ""}
          <button class="task-discard" type="button" data-close-record-drawer>Close</button>
        </div>`;
    },
    actions: {
      "use-recipient"(button) {
        applyTransmittalFields(t);
        t.recipient = button.dataset.name;
        t.recipientRole = transmittalsSentNewestFirst().find((item) => item.recipient === t.recipient)?.recipientRole || t.recipientRole;
        rerenderRecordDrawer();
      },
      "remove-drawing"(button) {
        applyTransmittalFields(t);
        const [removed] = t.drawings.splice(Number(button.dataset.index), 1);
        t.activity.push(`Removed ${removed.no} ${removed.name}`);
        rerenderRecordDrawer();
        renderTransmittals();
      },
      "add-drawings"() {
        applyTransmittalFields(t);
        openAddDrawingsDialog(t);
      },
      "view-pdf"() {
        if (t.status === "pending") applyTransmittalFields(t);
        closeRecordDrawer();
        showDocument("transmittal", t.no);
      },
      "edit-pdf"() {
        if (t.status === "pending") applyTransmittalFields(t);
        openTransmittalPdfEditor(t);
      },
      download() {
        if (t.status === "pending") applyTransmittalFields(t);
        downloadTransmittalPdf(t);
      },
      approve() {
        applyTransmittalFields(t);
        error = !t.recipient ? "Add a recipient before sending."
          : !t.drawings.length ? "Add at least one drawing before sending."
            : "";
        if (error) {
          rerenderRecordDrawer();
          recordBody.querySelector('[data-record-field="recipient"]')?.focus();
          return;
        }
        t.status = "sent";
        t.sent = toDateInput(new Date());
        t.approvedBy = profileState.name;
        t.activity.push(`Approved and sent to ${t.recipient} by ${profileState.name}`);
        renderTransmittals();
        closeRecordDrawer();
        showToast(`${t.no} sent to ${t.recipient} — ${t.drawings.length} drawing${t.drawings.length === 1 ? "" : "s"}, ${t.copies.color + t.copies.bw} copies.`);
      }
    },
    save() {
      applyTransmittalFields(t);
      t.activity.push(`Draft saved by ${profileState.name}`);
      renderTransmittals();
      return `${t.no} draft saved.`;
    }
  });
}

function openAddDrawingsDialog(t) {
  const included = new Set(t.drawings.map((drawing) => drawing.name.toLowerCase()));
  const options = projectFiles
    .filter((file) => /\.(dwg|dxf|pdf|rvt)$/i.test(file.name))
    .map((file) => ({ file, drawing: drawingFromFile(file.name, t.wing, t.drawings.length) }))
    .filter(({ drawing }) => !included.has(drawing.name.toLowerCase()));
  openActionDialog({
    title: `Add drawings to ${t.no}`,
    subtitle: "Drawing number, name and revision are read from each file.",
    fields: options.length
      ? [{ name: "files", label: "Project files", type: "checklist", options: options.map(({ file }) => file.name) }]
      : [],
    body: options.length ? "" : '<p class="action-dialog-text">Every drawing in Files is already on this transmittal.</p>',
    submitLabel: options.length ? "Add Drawings" : null,
    cancelLabel: options.length ? "Cancel" : "Close",
    onSubmit(values) {
      if (!values.files.length) {
        setActionError("Pick at least one file.");
        return false;
      }
      values.files.forEach((name) => t.drawings.push(drawingFromFile(name, t.wing, t.drawings.length)));
      t.activity.push(`Added ${values.files.length} drawing${values.files.length === 1 ? "" : "s"} from Files`);
      renderTransmittals();
      rerenderRecordDrawer();
    }
  });
}

function openRecordForRow(row) {
  if (row.matches("#rfiTable tbody tr, #project-rfi-list tr[data-rfi-index], [data-open-panel='rfis'] tr[data-oi-row]")) openRfiDrawer(row);
  else if (row.matches("#deliverables-table tbody tr, #tracker-list tr[data-tracker-index], [data-open-panel='deliverables'] tr[data-oi-row]")) openDeliverableDrawer(row);
  else if (row.matches("#transmittal-list tr[data-transmittal-index]")) openTransmittalDrawer(row);
}

// Clicking a row (not its buttons or checkbox) opens its details
document.addEventListener("click", (e) => {
  if (e.target.closest("button, a, input, select, label, .custom-checkbox")) return;
  const row = e.target.closest("tbody tr");
  if (row) openRecordForRow(row);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" || !e.target.matches("tr[data-tracker-index], tr[data-transmittal-index]")) return;
  e.preventDefault();
  openRecordForRow(e.target);
});

recordBackdrop.addEventListener("click", (e) => {
  if (e.target === recordBackdrop || e.target.closest("[data-close-record-drawer]")) {
    closeRecordDrawer();
    return;
  }

  if (e.target.closest("[data-record-attach]")) {
    recordAttachmentInput.click();
    return;
  }

  const action = e.target.closest("[data-record-action]");
  if (action && recordCtx?.actions?.[action.dataset.recordAction]) {
    recordCtx.actions[action.dataset.recordAction](action);
    return;
  }

  if (e.target.closest("[data-record-save]") && recordCtx) {
    const values = Object.fromEntries(Array.from(recordBody.querySelectorAll("[data-record-field]"), (field) => [field.dataset.recordField, field.value]));
    const message = recordCtx.save(values);
    closeRecordDrawer();
    showToast(message);
  }
});

recordBody.addEventListener("submit", (e) => {
  const form = e.target.closest("[data-record-thread]");
  if (!form || !recordCtx) return;
  e.preventDefault();
  const input = form.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  // The thread lives on the record, so it is still there next time the drawer opens
  const { data } = recordCtx;
  data.thread.push({ by: profileState.name, when: "Just now", text });
  data.activity.push(recordCtx.onThread ? recordCtx.onThread() : `Comment added by ${profileState.name}`);
  rerenderRecordDrawer();
  recordBody.querySelector("[data-record-thread] input").focus();
});

recordAttachmentInput.addEventListener("change", () => {
  if (!recordCtx) return;
  const names = Array.from(recordAttachmentInput.files, (file) => file.name);
  recordCtx.data.attachments.push(...names);
  names.forEach((name) => recordCtx.data.activity.push(`Attachment added: ${name}`));
  recordAttachmentInput.value = "";
  rerenderRecordDrawer();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !recordBackdrop.hidden && actionBackdrop.hidden) closeRecordDrawer();
});

/* DOCUMENT PAGE: BOQs, library documents, project files and transmittal PDFs open on their own page */
const docView = document.getElementById("doc-view");
const docBody = document.getElementById("doc-view-body");
pageSections.doc = docView;
let docReturnRoute = "";
let docObjectUrl = null;
let currentDocument = null;

const downloadIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>';
const docButton = (action, label, primary = false) => `<button class="${primary ? "project-task-add" : "task-advanced-filter-button"}" type="button" data-doc-action="${action}">${primary ? downloadIcon : ""}${label}</button>`;

const docRenderers = {
  library(key) {
    const [tabKey, index] = key.split("-");
    const tab = libraryTabs[tabKey];
    const doc = tab?.docs[Number(index)];
    if (!doc) return null;
    const crumbs = [{ label: "Library", view: "library" }, { label: tab.label, route: tabKey === "policies" ? "library" : `library/${tabKey}` }, { label: doc.name }];
    const meta = `${doc.no} · ${doc.version} · Updated ${formatLongDate(doc.updated)}`;

    if (tabKey === "boqs") {
      return {
        section: "library", crumbs, kicker: "BOQ", title: doc.name, meta,
        actions: docButton("download-boq", "Download Excel", true),
        body: boqSheetHtml(doc),
        context: { doc }
      };
    }

    const policy = tabKey === "policies";
    const pages = Number((doc.meta.match(/(\d+)\s*Pages/i) || [])[1]) || 1;
    return {
      section: "library", crumbs, kicker: policy ? "Policy · view only" : tab.label, title: doc.name, meta,
      // Policies can only be read here; everything else in the library can be downloaded
      actions: policy ? `<span class="doc-viewer-lock">${lockIcon} View only — policies can't be downloaded or printed</span>` : docButton("download-library", "Download", true),
      body: `
        <div class="doc-viewer doc-viewer-page">
          <div class="doc-viewer-bar"><span>Page 1 of ${pages}</span><span>${escapeHtml(doc.meta)}</span></div>
          ${libraryPageHtml(doc, tabKey)}
        </div>`,
      context: { doc }
    };
  },

  file(key) {
    const file = projectFiles[Number(key)];
    if (!file) return null;
    const project = currentProjectName();
    const kind = fileKind(file.name);
    let preview;
    if (file.file && (file.file.type === "application/pdf" || kind.kind === "pdf")) {
      docObjectUrl = URL.createObjectURL(file.file);
      preview = `<iframe class="doc-frame" src="${docObjectUrl}" title="${escapeHtml(file.name)}"></iframe>`;
    } else if (file.file && file.file.type.startsWith("image/")) {
      docObjectUrl = URL.createObjectURL(file.file);
      preview = `<div class="doc-image"><img src="${docObjectUrl}" alt="${escapeHtml(file.name)}"></div>`;
    } else {
      preview = `
        <div class="doc-unavailable">
          <span class="upload-file-icon ${kind.icon}">${kind.label}</span>
          <strong>${file.file ? `${kind.label} files can't be previewed in the browser` : "Preview isn't stored for this sample file"}</strong>
          <p>${kind.kind === "drawing" ? "Download it to open in AutoCAD or a DWG viewer." : "Download it to open on your computer."}</p>
        </div>`;
    }
    return {
      section: "projects",
      crumbs: [{ label: "Projects", view: "projects" }, { label: project, route: "project/overview" }, { label: "Files", route: "project/files" }, { label: file.name }],
      kicker: `${kind.label} · ${file.stage}`, title: file.name,
      meta: `${file.location} · ${file.size} · Uploaded by ${file.by} · ${file.when}`,
      actions: docButton("download-file", "Download", true),
      body: preview,
      context: { file }
    };
  },

  transmittal(key) {
    const t = transmittals.find((item) => item.no === key);
    if (!t) return null;
    const project = currentProjectName();
    return {
      section: "projects",
      crumbs: [{ label: "Projects", view: "projects" }, { label: project, route: "project/overview" }, { label: "Transmittals", route: "project/transmittals" }, { label: `${t.no} PDF` }],
      kicker: `Transmittal · ${t.status === "sent" ? `Sent ${transmittalDate(t.sent)}` : "Pending approval"}`,
      title: `${t.no} — ${t.wing}`,
      meta: `${t.drawings.length} drawing${t.drawings.length === 1 ? "" : "s"} · To ${t.recipient || "recipient not set"} · Source ${t.source}`,
      actions: `${t.status === "pending" ? docButton("review", "Review & Send") : ""}${docButton("edit-pdf", "Edit PDF")}${docButton("download-pdf", "Download PDF", true)}`,
      body: '<div class="doc-frame doc-frame-loading">Preparing PDF…</div>',
      context: { t },
      async after() {
        try {
          const pdf = await buildTransmittalPdf(t);
          if (currentDocument?.key !== `transmittal/${key}`) return;
          docObjectUrl = pdf.output("bloburl");
          docBody.innerHTML = `<iframe class="doc-frame" src="${docObjectUrl}" title="${t.no} PDF"></iframe>`;
        } catch (error) {
          docBody.innerHTML = `<div class="doc-unavailable"><strong>Couldn't show the PDF</strong><p>${escapeHtml(error.message)}</p></div>`;
        }
      }
    };
  }
};

function showDocument(kind, key) {
  const from = currentHash();
  if (!from.startsWith("doc/")) docReturnRoute = from;
  if (docObjectUrl) {
    URL.revokeObjectURL(docObjectUrl);
    docObjectUrl = null;
  }

  const view = docRenderers[kind]?.(String(key));
  if (!view) {
    showToast("That document isn't available any more.");
    renderRoute(docReturnRoute || "library");
    return;
  }

  currentDocument = { kind, key: `${kind}/${key}`, ...view.context };
  sidebarSection.doc = view.section;
  showPage("doc");
  document.getElementById("doc-view-kicker").textContent = view.kicker;
  document.getElementById("doc-view-title").textContent = view.title;
  document.getElementById("doc-view-meta").textContent = view.meta;
  document.getElementById("doc-view-actions").innerHTML = view.actions;
  docBody.innerHTML = view.body;
  renderBreadcrumb(view.crumbs);
  syncHash(`doc/${kind}/${key}`);
  view.after?.();
}

docView.addEventListener("click", (e) => {
  if (e.target.closest("[data-doc-back]")) {
    renderRoute(docReturnRoute || (currentDocument?.kind === "library" ? "library" : "project/overview"));
    return;
  }

  const button = e.target.closest("[data-doc-action]");
  if (!button || !currentDocument) return;
  const { doc, file, t } = currentDocument;
  const action = button.dataset.docAction;
  if (action === "download-boq") downloadBoq(doc, boqRows(boqSheets[doc.no] || []));
  else if (action === "download-library") showToast(`Downloading ${doc.no} — ${doc.name}…`);
  else if (action === "download-file") downloadProjectFile(file);
  else if (action === "download-pdf") downloadTransmittalPdf(t);
  else if (action === "edit-pdf") openTransmittalPdfEditor(t);
  else if (action === "review") {
    openProject(overviewPage.querySelector(".project-title").textContent, "transmittals");
    const row = document.querySelector(`#transmittal-list tr[data-transmittal-index="${transmittals.indexOf(t)}"]`);
    if (row) openTransmittalDrawer(row);
  }
});

// Search inside a BOQ: keep a bill's heading while any of its items match
docView.addEventListener("input", (e) => {
  const search = e.target.closest("[data-boq-search]");
  if (!search) return;
  const query = search.value.trim().toLocaleLowerCase();
  let bill = null;
  let billHasMatch = false;
  let matches = 0;
  const closeBill = () => { if (bill) bill.hidden = Boolean(query) && !billHasMatch; };
  Array.from(docView.querySelector(".boq-sheet tbody").rows).forEach((row) => {
    if (row.dataset.boqRow === "bill") {
      closeBill();
      bill = row;
      billHasMatch = false;
      return;
    }
    const ok = !query || (row.dataset.boqRow === "item" && row.textContent.toLocaleLowerCase().includes(query));
    row.hidden = !ok;
    if (ok && row.dataset.boqRow === "item") {
      billHasMatch = true;
      matches += 1;
    }
  });
  closeBill();
  docView.querySelector("[data-boq-empty]").hidden = !query || matches > 0;
});

// After a PDF edit, the open preview shows the new version
function refreshTransmittalPreview(t) {
  if (!docView.hidden && currentDocument?.key === `transmittal/${t.no}`) showDocument("transmittal", t.no);
}

/* RIGHT RAIL DATE */
function renderRailDate() {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-GB", { weekday: "long" });
  const month = now.toLocaleDateString("en-GB", { month: "long" });
  document.getElementById("rail-date").textContent = `${weekday}, ${now.getDate()} ${month}`;
  document.getElementById("rail-week").textContent = `Week ${getIsoWeek(now)} · ${now.getFullYear()}`;
}

/* CUSTOM DROPDOWNS: every native <select> becomes the same dropdown as Create Project.
   The hidden <select> stays the source of truth, so existing code reading .value keeps working. */
const nativeSelectValue = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
let selectSeq = 0;

const selectForDropdown = (dropdown) => document.getElementById(dropdown.dataset.selectFor);

function syncDropdown(dropdown) {
  const select = selectForDropdown(dropdown);
  if (!select) return;
  const text = select.selectedOptions[0]?.textContent.trim() || "";
  dropdown.querySelector(".select-value").textContent = text;
  const label = dropdown.dataset.label;
  dropdown.querySelector("summary").setAttribute("aria-label", label ? `${label}: ${text}` : text);
}

function renderDropdownOptions(dropdown) {
  const select = selectForDropdown(dropdown);
  dropdown.querySelector(".ui-select-menu").innerHTML = Array.from(select.options).map((option, index) => `
    <button class="ui-select-option" type="button" role="option" data-option-index="${index}" aria-selected="${option.selected}"${option.disabled ? " disabled" : ""}>
      <span>${escapeHtml(option.textContent.trim())}</span>
      <span class="option-check" aria-hidden="true">✓</span>
    </button>`).join("");
}

// Same idea as the calendar: measure in screen pixels, place in CSS pixels under the page zoom
function positionDropdownMenu(dropdown) {
  const menu = dropdown.querySelector(".ui-select-menu");
  const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
  const trigger = dropdown.querySelector("summary").getBoundingClientRect();
  const menuHeight = menu.getBoundingClientRect().height / zoom;
  const viewportHeight = window.innerHeight / zoom;
  const viewportWidth = window.innerWidth / zoom;
  const top = trigger.top / zoom;
  const bottom = trigger.bottom / zoom;
  const width = Math.max(trigger.width / zoom, 160);
  const openUp = viewportHeight - bottom < menuHeight + 12 && top > viewportHeight - bottom;
  menu.style.setProperty("--select-menu-top", `${openUp ? top - menuHeight + 1 : bottom - 1}px`);
  menu.style.setProperty("--select-menu-left", `${Math.min(trigger.left / zoom, viewportWidth - width - 12)}px`);
  menu.style.setProperty("--select-menu-width", `${width}px`);
  dropdown.classList.toggle("opens-up", openUp);
}

function enhanceSelects(root = document) {
  const selects = root.matches?.("select") ? [root] : Array.from(root.querySelectorAll?.("select") || []);
  selects.forEach((select) => {
    if (select.dataset.enhanced || select.multiple) return;
    select.dataset.enhanced = "true";
    if (!select.id) select.id = `select-field-${++selectSeq}`;

    const dropdown = document.createElement("details");
    dropdown.className = "custom-select ui-select";
    dropdown.dataset.selectFor = select.id;
    dropdown.dataset.label = (select.getAttribute("aria-label") || select.labels?.[0]?.textContent || "").replace("*", "").trim();
    dropdown.innerHTML = `<summary aria-haspopup="listbox"><span class="select-value"></span><span class="select-chevron" aria-hidden="true"></span></summary><div class="select-menu ui-select-menu" role="listbox"></div>`;

    select.classList.add("visually-hidden");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");

    // Drawer fields wrap the select in a bordered control; the dropdown brings its own border
    const wrapper = select.closest(".drawer-control");
    (wrapper || select).after(dropdown);
    if (wrapper) wrapper.hidden = true;

    Object.defineProperty(select, "value", {
      configurable: true,
      get() { return nativeSelectValue.get.call(this); },
      set(value) {
        nativeSelectValue.set.call(this, value);
        syncDropdown(dropdown);
      }
    });
    select.addEventListener("change", () => syncDropdown(dropdown));
    select.form?.addEventListener("reset", () => setTimeout(() => syncDropdown(dropdown)));

    Array.from(select.labels || []).forEach((label) => {
      label.addEventListener("click", (event) => {
        if (dropdown.contains(event.target)) return;
        event.preventDefault();
        dropdown.open = !dropdown.open;
        dropdown.querySelector("summary").focus();
      });
    });

    dropdown.addEventListener("toggle", () => {
      if (!dropdown.open) return;
      document.querySelectorAll(".ui-select[open], .date-picker[open]").forEach((other) => {
        if (other !== dropdown) other.open = false;
      });
      renderDropdownOptions(dropdown);
      positionDropdownMenu(dropdown);
      requestAnimationFrame(() => positionDropdownMenu(dropdown));
      dropdown.querySelector('.ui-select-option[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    });

    syncDropdown(dropdown);
  });
}

function chooseDropdownOption(option) {
  const dropdown = option.closest(".ui-select");
  const select = selectForDropdown(dropdown);
  const index = Number(option.dataset.optionIndex);
  dropdown.open = false;
  dropdown.querySelector("summary").focus();
  if (select.selectedIndex === index) return;
  select.selectedIndex = index;
  syncDropdown(dropdown);
  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

document.addEventListener("click", (event) => {
  const option = event.target.closest(".ui-select-option");
  if (option) {
    chooseDropdownOption(option);
    return;
  }
  document.querySelectorAll(".ui-select[open]").forEach((dropdown) => {
    if (!dropdown.contains(event.target)) dropdown.open = false;
  });
});

// Arrow keys move through options; arrow down on a closed dropdown opens it
document.addEventListener("keydown", (event) => {
  const dropdown = event.target.closest?.(".ui-select");
  if (!dropdown || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  if (!dropdown.open) {
    dropdown.open = true;
    requestAnimationFrame(() => (dropdown.querySelector('.ui-select-option[aria-selected="true"]') || dropdown.querySelector(".ui-select-option"))?.focus());
    return;
  }
  const options = Array.from(dropdown.querySelectorAll(".ui-select-option:not(:disabled)"));
  const current = options.indexOf(document.activeElement);
  const next = event.key === "Home" ? 0
    : event.key === "End" ? options.length - 1
      : event.key === "ArrowDown" ? Math.min(options.length - 1, current + 1)
        : Math.max(0, current - 1);
  options[next]?.focus();
});

["resize", "scroll"].forEach((type) => {
  window.addEventListener(type, () => {
    document.querySelectorAll(".ui-select[open]").forEach(positionDropdownMenu);
  }, true);
});

/* INITIAL RENDER */
enhanceSelects();
new MutationObserver((mutations) => {
  mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    enhanceSelects(node);
    enhanceDateInputs(node);
  }));
}).observe(document.body, { childList: true, subtree: true });
enhanceDateInputs();
renderRailDate();
applyProfile();
renderPrefs();
renderFiles();
renderTeam();
renderMilestones();
renderActivity();
renderTracker();
renderTransmittals();
renderNotifications();
renderSchedule();
updateFocusCounts();
updateTaskCount();

// Open whatever page the URL points at (#reporting, #library/boqs, #project/files...)
lastSyncedHash = currentHash();
renderRoute(lastSyncedHash);
