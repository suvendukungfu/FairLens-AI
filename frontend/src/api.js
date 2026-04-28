import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Bypass-Tunnel-Reminder': 'true'
  }
});

export async function uploadDataset(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function runAnalysis(sessionId, sensitiveAttributes, targetColumn, favorableOutcome = null) {
  const res = await api.post('/analysis/', {
    session_id: sessionId,
    sensitive_attributes: sensitiveAttributes,
    target_column: targetColumn,
    favorable_outcome: favorableOutcome,
  });
  return res.data;
}

export async function runMitigation(sessionId, sensitiveAttributes, targetColumn, strategy, favorableOutcome = null) {
  const res = await api.post('/mitigation/', {
    session_id: sessionId,
    sensitive_attributes: sensitiveAttributes,
    target_column: targetColumn,
    strategy,
    favorable_outcome: favorableOutcome,
  });
  return res.data;
}

export async function downloadReport(sessionId, sensitiveAttributes, targetColumn, favorableOutcome = null) {
  const res = await api.post('/report/pdf', {
    session_id: sessionId,
    sensitive_attributes: sensitiveAttributes,
    target_column: targetColumn,
    favorable_outcome: favorableOutcome,
  }, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'fairlens_report.pdf');
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function listKaggleDatasets() {
  const res = await api.get('/kaggle/datasets');
  return res.data;
}

export async function loadKaggleDataset(datasetId) {
  const res = await api.post(`/kaggle/load/${datasetId}`);
  return res.data;
}
