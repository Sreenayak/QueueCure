const STORAGE_KEY = 'queueCureState';

const defaultState = {
  queue: [],
  currentToken: null,
  nextTokenNumber: 1,
  averageConsultationTime: 15,
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      queue: Array.isArray(parsed.queue) ? parsed.queue : [],
    };
  } catch (error) {
    console.warn('Unable to load state', error);
    return { ...defaultState };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function formatToken(tokenNumber) {
  return `A-${String(tokenNumber).padStart(3, '0')}`;
}

function renderReceptionist(state) {
  const currentTokenEl = document.getElementById('currentToken');
  const queueLengthEl = document.getElementById('queueLength');
  const avgConsultationEl = document.getElementById('avgConsultation');
  const queueListEl = document.getElementById('queueList');
  const avgTimeInput = document.getElementById('avgTime');
  const receptionMessage = document.getElementById('receptionMessage');
  const timeMessage = document.getElementById('timeMessage');

  currentTokenEl.textContent = state.currentToken ? `${formatToken(state.currentToken.token)} – ${state.currentToken.name}` : '—';
  queueLengthEl.textContent = String(state.queue.length);
  avgConsultationEl.textContent = `${state.averageConsultationTime} min`;
  avgTimeInput.value = state.averageConsultationTime;

  receptionMessage.textContent = '';
  receptionMessage.className = 'muted form-message';
  timeMessage.textContent = '';
  timeMessage.className = 'muted form-message';

  queueListEl.innerHTML = state.queue.length
    ? state.queue
        .map(
          (item) => `
        <div class="queue-item">
          <div>
            <strong>${formatToken(item.token)}</strong>
            <div>${item.name}</div>
          </div>
          <span>Waiting</span>
        </div>
      `
        )
        .join('')
    : '<p class="muted">No patients waiting.</p>';
}

function renderWaitingRoom(state) {
  const displayCurrentToken = document.getElementById('displayCurrentToken');
  const tokensAhead = document.getElementById('tokensAhead');
  const estimatedWait = document.getElementById('estimatedWait');
  const waitingList = document.getElementById('waitingList');

  displayCurrentToken.textContent = state.currentToken ? `${formatToken(state.currentToken.token)} – ${state.currentToken.name}` : 'Waiting for next patient';
  tokensAhead.textContent = String(state.queue.length);
  estimatedWait.textContent = `${state.queue.length * state.averageConsultationTime} min`;

  waitingList.innerHTML = state.queue.length
    ? state.queue
        .map(
          (item, index) => `
        <div class="queue-item">
          <div>
            <strong>${formatToken(item.token)}</strong>
            <div>${item.name}</div>
          </div>
          <span>Position ${index + 1}</span>
        </div>
      `
        )
        .join('')
    : '<p class="muted">No patients are waiting.</p>';
}

function renderIndexHero(state) {
  const el = document.getElementById('indexCurrentToken');
  if (!el) return;

  // current token
  el.textContent = state.currentToken ? `${formatToken(state.currentToken.token)}` : '—';

  // upcoming chips
  const upcomingEls = document.querySelectorAll('.upcoming-item');
  for (let i = 0; i < upcomingEls.length; i++) {
    const item = upcomingEls[i];
    const data = state.queue[i];
    const tokenEl = item.querySelector('.upcoming-token');
    const timeEl = item.querySelector('.upcoming-time');
    if (data) {
      tokenEl.textContent = String(data.token).padStart(3, '0');
      const estimated = (i + 1) * state.averageConsultationTime;
      timeEl.textContent = `~${estimated} min`;
    } else {
      tokenEl.textContent = '--';
      timeEl.textContent = '';
    }
  }
}

function syncRender() {
  const state = loadState();
  const pageId = document.body.id;

  if (pageId === 'receptionist') {
    renderReceptionist(state);
  }
  if (pageId === 'waiting-room') {
    renderWaitingRoom(state);
  }
  if (pageId === 'index') {
    renderIndexHero(state);
  }
}

function showReceptionistMessage(elementId, message, type = 'error') {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = message;
  element.className = `form-message ${type}`;
}

function clearReceptionistMessages() {
  showReceptionistMessage('receptionMessage', '', '');
  showReceptionistMessage('timeMessage', '', '');
}

function addPatient(name) {
  if (!name.trim()) {
    showReceptionistMessage('receptionMessage', 'Please enter a patient name.', 'error');
    return;
  }

  const state = loadState();
  const tokenNumber = state.nextTokenNumber;
  state.queue.push({ token: tokenNumber, name: name.trim() });
  state.nextTokenNumber += 1;
  saveState(state);
  syncRender();
  showReceptionistMessage('receptionMessage', `Added ${formatToken(tokenNumber)} for ${name.trim()}.`, 'success');
}

function callNext() {
  const state = loadState();
  if (state.queue.length === 0) {
    showReceptionistMessage('receptionMessage', 'No patients are waiting to be called.', 'error');
    return;
  }
  state.currentToken = state.queue.shift();
  saveState(state);
  syncRender();
  showReceptionistMessage('receptionMessage', `Now calling ${formatToken(state.currentToken.token)}.`, 'success');
}

function saveAverageTime(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes < 1) {
    showReceptionistMessage('timeMessage', 'Enter a valid consultation time of 1 minute or more.', 'error');
    return;
  }
  const state = loadState();
  state.averageConsultationTime = Math.round(minutes);
  saveState(state);
  syncRender();
  showReceptionistMessage('timeMessage', `Average consultation time set to ${state.averageConsultationTime} min.`, 'success');
}

function initReceptionist() {
  const addPatientBtn = document.getElementById('addPatientBtn');
  const patientNameInput = document.getElementById('patientName');
  const callNextBtn = document.getElementById('callNextBtn');
  const saveTimeBtn = document.getElementById('saveTimeBtn');
  const avgTimeInput = document.getElementById('avgTime');

  addPatientBtn.addEventListener('click', () => {
    addPatient(patientNameInput.value);
    patientNameInput.value = '';
    patientNameInput.focus();
  });

  patientNameInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addPatientBtn.click();
    }
  });

  callNextBtn.addEventListener('click', () => {
    callNext();
  });

  saveTimeBtn.addEventListener('click', () => {
    saveAverageTime(avgTimeInput.value);
  });

  patientNameInput.addEventListener('input', () => {
    if (patientNameInput.value.trim()) {
      clearReceptionistMessages();
    }
  });

  avgTimeInput.addEventListener('input', () => {
    if (Number(avgTimeInput.value) >= 1) {
      clearReceptionistMessages();
    }
  });

  avgTimeInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveAverageTime(avgTimeInput.value);
    }
  });
}

window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    syncRender();
  }
});

window.addEventListener('DOMContentLoaded', () => {
  syncRender();
  if (document.body.id === 'receptionist') {
    initReceptionist();
  }
});
