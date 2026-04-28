import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      accentColor: 'purple',
      highContrast: false,
      setTheme: (theme) => set({ theme }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setHighContrast: (highContrast) => set({ highContrast }),

      // Dataset State
      datasetInfo: null,
      kaggleMeta: null,
      sessionId: null,
      setDatasetInfo: (datasetInfo) => set({ datasetInfo }),
      setKaggleMeta: (kaggleMeta) => set({ kaggleMeta }),
      setSessionId: (sessionId) => set({ sessionId }),

      // Analysis State
      analysisResult: null,
      mitigationResult: null,
      setAnalysisResult: (analysisResult) => set({ analysisResult }),
      setMitigationResult: (mitigationResult) => set({ mitigationResult }),

      // Configuration
      selectedAttrs: [],
      targetColumn: '',
      favorableOutcome: '',
      setSelectedAttrs: (selectedAttrs) => set({ selectedAttrs }),
      setTargetColumn: (targetColumn) => set({ targetColumn }),
      setFavorableOutcome: (favorableOutcome) => set({ favorableOutcome }),

      // UI State
      activeTab: 'overview',
      sidebarCollapsed: false,
      isLoading: false,
      alerts: [],
      setActiveTab: (activeTab) => set({ activeTab }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setIsLoading: (isLoading) => set({ isLoading }),

      // Alerts
      addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
      removeAlert: (id) => set((state) => ({ alerts: state.alerts.filter(a => a.id !== id) })),
      clearAlerts: () => set({ alerts: [] }),

      // Notifications
      notifications: [],
      addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { ...notification, id: Date.now() }]
      })),
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      // Simulations
      simulationParams: {},
      simulationResults: null,
      setSimulationParams: (simulationParams) => set({ simulationParams }),
      setSimulationResults: (simulationResults) => set({ simulationResults }),

      // Model Comparisons
      modelComparisons: [],
      setModelComparisons: (modelComparisons) => set({ modelComparisons }),

      // Timeline
      timelineData: [],
      setTimelineData: (timelineData) => set({ timelineData }),

      // Reset
      reset: () => set({
        datasetInfo: null,
        kaggleMeta: null,
        sessionId: null,
        analysisResult: null,
        mitigationResult: null,
        selectedAttrs: [],
        targetColumn: '',
        favorableOutcome: '',
        activeTab: 'overview',
        simulationParams: {},
        simulationResults: null,
        modelComparisons: [],
        alerts: [],
        notifications: [],
      }),
    }),
    {
      name: 'fairlens-storage',
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        highContrast: state.highContrast,
      }),
    }
  )
);