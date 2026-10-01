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
const colleagueSearchInput = document.querySelector('.colleague-search-input');
const teamMemberRows = Array.from(teamPicker.querySelectorAll('.team-options > label:not(.colleague-search)'));
const noColleaguesMessage = teamPicker.querySelector('.no-colleagues');
let dialogReturnFocus = null;

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
  colleagueSearchInput.value = '';
  filterTeamMembers();
  dialogReturnFocus?.focus();
}

function updateCharacterCount() {
  characterCount.textContent = `${projectDescription.value.length} / 500`;
}

function updateTeamSelection() {
  const selectedMembers = teamMemberInputs.filter((input) => input.checked);
  const names = selectedMembers.map((input) => input.parentElement.textContent.trim());
  const avatarNames = names.map((name) => name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase());
  const avatars = teamPicker.querySelector('.team-avatars');

  teamSelectionCount.textContent = `${selectedMembers.length} ${selectedMembers.length === 1 ? 'member' : 'members'} selected · Add or remove`;
  avatars.replaceChildren(...avatarNames.slice(0, 3).map((initials) => {
    const avatar = document.createElement('span');
    avatar.textContent = initials;
    return avatar;
  }));
  avatars.hidden = selectedMembers.length === 0;
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
  if (!projectForm.reportValidity()) return;

  closeProjectDialog();
  projectForm.reset();
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
