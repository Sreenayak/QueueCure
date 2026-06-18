function renderPatientsList(patients = null) {
  const patientsData = patients || loadPatients();
  const patientsListEl = document.getElementById('patientsList');
  const patientsList = Object.values(patientsData.patients);
  
  if (patientsList.length === 0) {
    patientsListEl.innerHTML = '<p class="muted">No patient records found.</p>';
    return;
  }
  
  patientsListEl.innerHTML = patientsList
    .map(patient => `
      <div class="patient-item" data-patient-key="${patient.name.toLowerCase()}_${patient.phone}">
        <div class="patient-item-header">
          <div class="patient-name">${patient.name}</div>
          <div class="patient-visits">${patient.visits.length} visits</div>
        </div>
        <div class="patient-item-meta">
          <div><strong>Phone:</strong> ${patient.phone}</div>
          <div><strong>Registered:</strong> ${new Date(patient.registeredDate).toLocaleDateString()}</div>
          <div><strong>Last Visit:</strong> ${patient.visits.length > 0 ? new Date(patient.visits[patient.visits.length - 1].date).toLocaleDateString() : 'N/A'}</div>
        </div>
      </div>
    `)
    .join('');
  
  // Add click event listeners
  document.querySelectorAll('.patient-item').forEach(item => {
    item.addEventListener('click', () => {
      const patientKey = item.dataset.patientKey;
      const patient = patientsData.patients[patientKey];
      showPatientDetails(patient);
    });
  });
}

function showPatientDetails(patient) {
  const detailsPanel = document.getElementById('patientDetailsPanel');
  const detailsContent = document.getElementById('patientDetails');
  
  let visitsHtml = '<h4>Visit History</h4>';
  if (patient.visits.length === 0) {
    visitsHtml += '<p class="muted">No visits recorded.</p>';
  } else {
    visitsHtml += '<div class="visits-list">';
    patient.visits.forEach(visit => {
      visitsHtml += `
        <div class="visit-record">
          <div><strong>Date:</strong> ${new Date(visit.date).toLocaleDateString()}</div>
          <div><strong>Doctor:</strong> ${visit.doctor}</div>
          <div><strong>Wait Time:</strong> ${visit.waitTime} min</div>
          ${visit.notes ? `<div><strong>Notes:</strong> ${visit.notes}</div>` : ''}
        </div>
      `;
    });
    visitsHtml += '</div>';
  }
  
  detailsContent.innerHTML = `
    <div class="patient-header">
      <h3>${patient.name}</h3>
    </div>
    <div class="patient-info">
      <div><strong>ID:</strong> ${patient.id}</div>
      <div><strong>Phone:</strong> ${patient.phone}</div>
      <div><strong>Registered:</strong> ${new Date(patient.registeredDate).toLocaleDateString()}</div>
      <div><strong>Total Visits:</strong> ${patient.visits.length}</div>
    </div>
    ${patient.medicalNotes ? `<div class="medical-notes"><strong>Medical Notes:</strong><p>${patient.medicalNotes}</p></div>` : ''}
    ${visitsHtml}
  `;
  
  detailsPanel.style.display = 'block';
}

function searchPatients() {
  const searchInput = document.getElementById('searchPatient');
  const searchTerm = searchInput.value.toLowerCase();
  const patientsData = loadPatients();
  
  let filteredPatients = {};
  Object.entries(patientsData.patients).forEach(([key, patient]) => {
    if (
      patient.name.toLowerCase().includes(searchTerm) ||
      patient.phone.includes(searchTerm)
    ) {
      filteredPatients[key] = patient;
    }
  });
  
  renderPatientsList({ patients: filteredPatients });
}

function initPatientRecords() {
  const searchInput = document.getElementById('searchPatient');
  
  if (searchInput) {
    searchInput.addEventListener('input', searchPatients);
  }
  
  renderPatientsList();
}

if (document.body.id === 'patient-records') {
  document.addEventListener('DOMContentLoaded', initPatientRecords);
}