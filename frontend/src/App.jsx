import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppLayout from './components/AppLayout';
import DashboardOverview from './pages/DashboardOverview';
import DatasetAnalysis from './pages/DatasetAnalysis';
import ModelPerformance from './pages/ModelPerformance';
import FairnessMetrics from './pages/FairnessMetrics';
import BiasDetection from './pages/BiasDetection';
import Mitigation from './pages/Mitigation';
import Simulation from './pages/Simulation';
import Timeline from './pages/Timeline';
import ModelComparison from './pages/ModelComparison';
import Reports from './pages/Reports';
import Explanations from './pages/Explanations';
import { useAppStore } from './store/useAppStore';
import UploadSection from './components/UploadSection';
import './index.css';

function ProtectedRoute({ children }) {
  const { datasetInfo } = useAppStore();

  if (!datasetInfo) {
    return <Navigate to="/upload" replace />;
  }

  return children;
}

function UploadPage() {
  const { datasetInfo } = useAppStore();

  if (datasetInfo) {
    return <Navigate to="/overview" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700/30 bg-slate-900/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black bg-linear-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">FairLens AI</h1>
              <p className="text-xs text-slate-500">Bias Detection & Mitigation Platform</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-black text-slate-100 mb-4">
            Detect Bias in Your AI Models
          </h1>
          <p className="text-lg text-slate-400">
            Upload a dataset or load a sample to begin fairness analysis
          </p>
        </div>
        <UploadSection />
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/upload" replace />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route
                path="/overview"
                element={
                  <ProtectedRoute>
                    <AppLayout><DashboardOverview /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dataset"
                element={
                  <ProtectedRoute>
                    <AppLayout><DatasetAnalysis /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/performance"
                element={
                  <ProtectedRoute>
                    <AppLayout><ModelPerformance /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/metrics"
                element={
                  <ProtectedRoute>
                    <AppLayout><FairnessMetrics /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bias"
                element={
                  <ProtectedRoute>
                    <AppLayout><BiasDetection /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mitigation"
                element={
                  <ProtectedRoute>
                    <AppLayout><Mitigation /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/simulation"
                element={
                  <ProtectedRoute>
                    <AppLayout><Simulation /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/timeline"
                element={
                  <ProtectedRoute>
                    <AppLayout><Timeline /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compare"
                element={
                  <ProtectedRoute>
                    <AppLayout><ModelComparison /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <AppLayout><Reports /></AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/explain"
                element={
                  <ProtectedRoute>
                    <AppLayout><Explanations /></AppLayout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;