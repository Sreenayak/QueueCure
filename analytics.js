function renderAnalyticsDashboard() {
  const analytics = getAnalyticsReport();
  
  document.getElementById('totalConsultations').textContent = analytics.totalConsultations;
  document.getElementById('totalNoShows').textContent = analytics.totalNoShows;
  document.getElementById('avgWaitTime').textContent = analytics.overallAverageWaitTime + ' min';
  document.getElementById('totalTimeSpent').textContent = analytics.totalTimeSpent + ' min';
  document.getElementById('peakDay').textContent = analytics.peakDay 
    ? new Date(analytics.peakDay.date).toLocaleDateString() 
    : '—';
  
  renderDailyMetrics(analytics.dailyMetrics);
}

function renderDailyMetrics(dailyMetrics) {
  const dailyMetricsListEl = document.getElementById('dailyMetricsList');
  
  if (!dailyMetrics || dailyMetrics.length === 0) {
    dailyMetricsListEl.innerHTML = '<p class="muted">No metrics data available.</p>';
    return;
  }
  
  // Sort by date descending (most recent first)
  const sortedMetrics = [...dailyMetrics].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  dailyMetricsListEl.innerHTML = sortedMetrics
    .map(metric => `
      <div class="metric-row">
        <div class="metric-date">${new Date(metric.date).toLocaleDateString()}</div>
        <div class="metric-details">
          <div class="metric-item">
            <span class="metric-label">Consultations:</span>
            <span class="metric-val">${metric.consultations}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">Avg Wait:</span>
            <span class="metric-val">${metric.averageWaitTime} min</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">No-Shows:</span>
            <span class="metric-val">${metric.noShows}</span>
          </div>
        </div>
      </div>
    `)
    .join('');
}

function exportReport() {
  const analytics = getAnalyticsReport();
  const report = `
QueueCure Analytics Report
Generated: ${new Date().toLocaleString()}

====== SUMMARY ======
Total Consultations: ${analytics.totalConsultations}
Total No-Shows: ${analytics.totalNoShows}
Overall Average Wait Time: ${analytics.overallAverageWaitTime} minutes
Total Time Spent: ${analytics.totalTimeSpent} minutes
Busiest Day: ${analytics.peakDay ? new Date(analytics.peakDay.date).toLocaleDateString() : 'N/A'}

====== DAILY METRICS ======
${analytics.dailyMetrics
  .sort((a, b) => new Date(b.date) - new Date(a.date))
  .map(m => `
Date: ${new Date(m.date).toLocaleDateString()}
  - Consultations: ${m.consultations}
  - Average Wait Time: ${m.averageWaitTime} min
  - No-Shows: ${m.noShows}
`)
  .join('\n')}

====== END OF REPORT ======
  `;
  
  // Create blob and download
  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `queuecure-report-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function resetAnalytics() {
  if (!confirm('Are you sure you want to reset all analytics data? This cannot be undone.')) {
    return;
  }
  
  localStorage.removeItem(ANALYTICS_KEY);
  renderAnalyticsDashboard();
  alert('Analytics data has been reset.');
}

function initAnalytics() {
  const exportBtn = document.getElementById('exportReportBtn');
  const resetBtn = document.getElementById('resetAnalyticsBtn');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', exportReport);
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAnalytics);
  }
  
  renderAnalyticsDashboard();

  window.addEventListener('storage', (event) => {
    if (event.key === ANALYTICS_KEY || event.key === STORAGE_KEY) {
      renderAnalyticsDashboard();
    }
  });

  window.addEventListener('focus', renderAnalyticsDashboard);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      renderAnalyticsDashboard();
    }
  });
}

if (document.body.id === 'analytics') {
  document.addEventListener('DOMContentLoaded', initAnalytics);
}
