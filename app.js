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
  const currentNameEl = document.getElementById('currentName');
  const nowCountEl = document.getElementById('nowCount');
  const queueListEl = document.getElementById('queueList');
  const avgDisplay = document.getElementById('avgTimeDisplay');
  const receptionMessage = document.getElementById('receptionMessage');
  const timeMessage = document.getElementById('timeMessage');

  currentTokenEl.textContent = state.currentToken ? `${formatToken(state.currentToken.token)}` : '—';
  currentNameEl.textContent = state.currentToken ? state.currentToken.name : '';
  nowCountEl.textContent = `${state.queue.length} waiting in queue`;
  if (avgDisplay) avgDisplay.textContent = String(state.averageConsultationTime);

  receptionMessage.textContent = '';
  receptionMessage.className = 'form-message muted';
  timeMessage.textContent = '';
  timeMessage.className = 'form-message muted';

  if (!queueListEl) return;
  if (state.queue.length === 0) {
    queueListEl.innerHTML = '<p class="muted">No patients waiting.</p>';
  } else {
    queueListEl.innerHTML = state.queue
      .map((item) => {
        return `
          <div class="queue-item">
            <div style="display:flex;align-items:center">
              <div class="token-pill">${formatToken(item.token)}</div>
              <div>
                <div><strong>${item.name}</strong></div>
                <div class="item-meta">${item.phone || ''}</div>
              </div>
            </div>
            <div class="item-actions">
              <button data-skip-token="${item.token}">Skip</button>
            </div>
          </div>
        `;
      })
      .join('');
  }
}

function renderWaitingRoom(state) {
  const displayCurrentToken = document.getElementById('displayCurrentToken');
  const displayCurrentName = document.getElementById('displayCurrentName');
  const waitingList = document.getElementById('waitingList');
  const displayQueueCount = document.getElementById('displayQueueCount');
  const displayAvg = document.getElementById('displayAvg');

  displayCurrentToken.textContent = state.currentToken ? `${formatToken(state.currentToken.token)}` : '—';
  displayCurrentName.textContent = state.currentToken ? state.currentToken.name : '';
  if (displayQueueCount) displayQueueCount.textContent = String(state.queue.length);
  if (displayAvg) displayAvg.textContent = String(state.averageConsultationTime);

  if (!waitingList) return;
  waitingList.innerHTML = state.queue.length
    ? state.queue
        .map((item, index) => `
        <div class="queue-item">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="token-pill">${formatToken(item.token)}</div>
            <div>
              <div><strong>${item.name}</strong></div>
              <div class="item-meta">Next up · ~${(index + 1) * state.averageConsultationTime} min</div>
            </div>
          </div>
        </div>
      `)
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
  // collect optional phone if present in DOM
  const phoneInput = document.getElementById('patientPhone');
  const phone = phoneInput ? phoneInput.value.trim() : '';
  state.queue.push({ token: tokenNumber, name: name.trim(), phone });
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

function skipToken(tokenNumber) {
  const state = loadState();
  const idx = state.queue.findIndex((q) => q.token === tokenNumber);
  if (idx === -1) return;
  const removed = state.queue.splice(idx, 1)[0];
  saveState(state);
  syncRender();
  showReceptionistMessage('receptionMessage', `Skipped ${formatToken(removed.token)}.`, 'success');
}

function resetQueue() {
  if (!confirm('Reset the queue and current token?')) return;
  const state = { ...defaultState };
  saveState(state);
  syncRender();
}

function changeAverage(delta) {
  const state = loadState();
  state.averageConsultationTime = Math.max(1, Math.round(state.averageConsultationTime + delta));
  saveState(state);
  syncRender();
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
  const avgMinusBtn = document.getElementById('avgMinusBtn');
  const avgPlusBtn = document.getElementById('avgPlusBtn');
  const resetQueueBtn = document.getElementById('resetQueueBtn');

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
  patientNameInput.addEventListener('input', () => {
    if (patientNameInput.value.trim()) {
      clearReceptionistMessages();
    }
  });

  if (saveTimeBtn && avgTimeInput) {
    saveTimeBtn.addEventListener('click', () => {
      saveAverageTime(avgTimeInput.value);
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

  if (avgMinusBtn) avgMinusBtn.addEventListener('click', () => changeAverage(-1));
  if (avgPlusBtn) avgPlusBtn.addEventListener('click', () => changeAverage(1));
  if (resetQueueBtn) resetQueueBtn.addEventListener('click', resetQueue);
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

// attach global click handler for skip buttons rendered dynamically
window.addEventListener('click', (e) => {
  const skip = e.target.closest('[data-skip-token]');
  if (skip) {
    const token = Number(skip.getAttribute('data-skip-token'));
    skipToken(token);
  }
});
