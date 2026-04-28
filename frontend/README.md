# FairLens AI - Premium Fairness Dashboard

A world-class, production-ready AI fairness auditing platform with advanced bias detection, real-time simulation, and stunning UI/UX.

![FairLens AI](https://img.shields.io/badge/FairLens-AI-blue?style=for-the-badge)

## 🚀 Features Overview

### Core Capabilities
- **Real-time Model Simulation**: Adjust input parameters and instantly see prediction changes and fairness impacts
- **Bias Detection & Alerts**: Automated detection with severity-based notifications and actionable insights
- **Multi-Model Comparison**: Side-by-side comparison of original vs mitigated models with radar charts
- **Fairness Score System**: Composite 0-100 score with animated gauge and drill-down details
- **Interactive Visualizations**: Bar, radar, line, area, and pie charts using Recharts
- **Before/After Mitigation**: Compare model performance with different debiasing strategies
- **Timeline View**: Track fairness improvements across model iterations
- **PDF Report Generation**: Export professional reports with all metrics and visualizations
- **Dark/Light Theme**: Adaptive theme with smooth transitions
- **Mobile Responsive**: Fully optimized for all screen sizes

## 🎨 UI/UX Excellence

### Premium Design System
- **Glassmorphism Effects**: Elegant frosted-glass cards with backdrop blur
- **Framer Motion Animations**: Smooth page transitions and micro-interactions
- **Color-Coded Bias Indicators**: Green/Yellow/Red severity system
- **Loading Skeletons**: Elegant Skeleton loaders for perceived performance
- **Toast Notifications**: Non-intrusive feedback system
- **Custom Scrollbars**: Polished scrolling experience

### Navigation & Layout
- Collapsible sidebar with animated transitions
- Responsive header with dataset info
- Keyboard shortcuts (Ctrl+1-5 for tabs)
- Mobile hamburger menu with overlay

## 📊 Dashboard Pages

### 1. Executive Overview
- **KPI Cards**:
  - Model Accuracy
  - Bias Risk Score
  - Disparate Impact
  - Selection Rate Gap
- **Fairness Gauge**: Animated speedometer showing overall fairness (0-100)
- **Bias Alerts**: Real-time notification system for detected issues
- **Quick Actions**: One-click access to key features

### 2. Dataset Analysis
- Dataset info statistics
- **Feature Distribution Charts**: Bar charts for categorical features
- **Missing Values Heatmap**: Visual representation of data quality
- **Imbalance Detection**: Highlighting skewed distributions
- **Bias Risk Indicators**: Per-feature fairness assessment

### 3. Model Performance
- Accuracy, Precision, Recall, F1 Score cards
- **Training/Validation Curves**: Interactive area chart
- **Confusion Matrix**: Visual breakdown of TP/FP/TN/FN
- **ROC Curve**: With AUC calculation
- **Fairness Radar**: Multi-dimensional fairness profile

### 4. Fairness Metrics
- Interactive metric cards with thresholds
- **Debug View**: Bar charts comparing groups
- **Radar Visualization**: Fairness profile across dimensions
- **Table View**: Raw metric values with status indicators
- **Tooltips & Explanations**: Plain-English descriptions

### 5. Bias Detection (Core Feature)
- **Biased Group Highlights**: Color-coded alert cards
- **Impact Statements**: "Females have 35% lower approval rate"
- **Severity Heatmap**: Grid showing bias levels per metric
- **Group Disparity Charts**: Visual comparison across demographics
- **Proactive Alert System**: Configurable threshold-based notifications

### 6. Mitigation (WOW Feature)
- **Before/After Comparison**: Side-by-side metric comparison
- **Four Strategies**: Reweighting, Adversarial, Fairlearn, Disparate Impact Removal
- **Slider Controller**: Compare original vs mitigated model
- **Improvement Percentages**: Quantified bias reduction metrics
- **Radar Overlay**: Visual fairness profile transformation

### 7. Real-time Simulator
- **Interactive Input Sliders**: Adjust age, income, education, etc.
- **Demographic Selectors**: Choose gender, race, age group
- **Live Prediction**: Instant probability calculation
- **Fairness Impact Meters**: See how decisions affect different groups
- **Group Comparison Chart**: Approval rates across demographics
- **AI-Generated Insights**: Natural language explanations of outcomes

### 8. Timeline View
- **Version History**: Track model iterations
- **Metric Evolution**: Line chart showing fairness improvement
- **Annotations**: Mark key events (bias mitigation applied)
- **Progress Summary**: Aggregate improvement statistics
- **Date Range Filtering**: Focus on specific periods

### 9. Multi-Model Comparison
- **Side-by-Side Radar**: Compare up to 4 models simultaneously
- **Bar Chart Overlay**: Parallel metric visualization
- **Table View**: Detailed comparison matrix
- **Best Model Badges**: Crown icons for top performers
- **Trade-off Analysis**: Fairness vs accuracy balance

### 10. Reports
- **PDF Generation**: One-click professional report creation
- **Configurable Sections**: Toggle inclusion of executive summary, metrics, recommendations
- **JSON Export**: Raw data for further analysis
- **CSV Export**: Metric tables in spreadsheet format
- **Branding Options**: Customize report appearance

### 11. Explainability
- **Feature Importance Chart**: Top contributing factors
- **Shapley Values**: Local explanations per prediction
- **Human-Readable Summaries**: "Education strongly influenced outcome"

## 🔧 Technical Architecture

### Tech Stack
- **Frontend**: React 19, Vite, React Router DOM 6
- **State Management**: Zustand (lightweight, performant)
- **Animations**: Framer Motion 11
- **Charts**: Recharts 2
- **Styling**: TailwindCSS 4 with custom utilities
- **Icons**: Lucide React

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── AnimationUtils.jsx      # Motion variants & helpers
│   │   ├── AlertSystem.jsx         # Bias alert display
│   │   ├── AppLayout.jsx           # Main layout wrapper
│   │   ├── BiasScoreGauge.jsx      # Animated gauge component
│   │   ├── CardSkeleton            # Loading skeleton
│   │   ├── ErrorBoundary           # Error handling
│   │   ├── FairnessScoreGauge.jsx  # Premium gauge
│   │   ├── KPICard.jsx             # KPI metric card
│   │   ├── NotificationPanel.jsx   # Dropdown notifications
│   │   ├── PageTransition.jsx      # Page transitions
│   │   ├── Skeleton.jsx            # Loader components
│   │   ├── Sidebar.jsx             # Navigation sidebar
│   │   ├── ThemeToggle.jsx         # Dark/light mode
│   │   └── ... (individual feature components)
│   ├── contexts/
│   │   ├── ThemeContext.jsx        # Theme state
│   │   └── ToastContext.jsx        # Toast notifications
│   ├── pages/
│   │   ├── DashboardOverview.jsx   # Executive summary
│   │   ├── DatasetAnalysis.jsx     # Data quality analysis
│   │   ├── ModelPerformance.jsx    # Accuracy metrics
│   │   ├── FairnessMetrics.jsx     # Fairness evaluation
│   │   ├── BiasDetection.jsx       # Bias identification
│   │   ├── Mitigation.jsx          # Bias reduction
│   │   ├── Simulation.jsx          # Real-time simulator
│   │   ├── Timeline.jsx            # Progress tracker
│   │   ├── ModelComparison.jsx     # Multi-model eval
│   │   └── Reports.jsx             # Export functionality
│   ├── store/
│   │   └── useAppStore.js          # Zustand state
│   ├── App.jsx                     # Router & providers
│   ├── index.css                   # Global styles
│   └── main.jsx                    # Entry point
└── package.json
```

## 🎨 Design System

### Color Palette
- **Primary**: `#6366f1` (Indigo 500)
- **Success**: `#22c55e` (Emerald 500)
- **Warning**: `#f59e0b` (Amber 500)
- **Danger**: `#ef4444` (Red 500)
- **Background**: `#0f172a` (Slate 900) - Dark mode default

### Typography
- **Font**: Inter (system-ui)
- **Headings**: font-black, letter-spacing-tight
- **Body**: text-slate-300

### Spacing
- **Base unit**: 4px / 0.25rem
- **Card padding**: 1.5rem (p-6)
- **Section spacing**: 2rem (space-y-8)

## 📱 Responsive Breakpoints

```
sm:  640px   (Mobile landscape)
md:  768px   (Tablet portrait)
lg:  1024px  (Tablet landscape / Desktop)
xl:  1280px  (Large desktop)
```

## ⚡ Performance Optimizations

- **Code Splitting**: Lazy-loaded pages via React.lazy
- **Memoization**: Heavy chart calculations cached
- **Skeleton Loading**: Perceived performance enhancement
- **Virtual Scrolling**: Efficient table rendering
- **Bundle Size**: Tree-shaken dependencies

## 🎯 User Workflow

1. **Upload**: CSV dataset or Kaggle sample
2. **Configure**: Select sensitive attributes & target
3. **Analyze**: Run fairness metrics
4. **Detect**: View bias alerts and heatmaps
5. **Mitigate**: Apply debiasing strategies
6. **Compare**: Before/after model evaluation
7. **Simulate**: Test edge cases with real-time inputs
8. **Report**: Export findings to PDF/CSV/JSON

## 🔐 State Management

### Zustand Store Structure
```javascript
{
  theme: 'dark' | 'light',
  datasetInfo: null | { ... },
  analysisResult: null | { fairness_metrics, group_comparisons, ... },
  selectedAttrs: [],
  targetColumn: '',
  activeTab: 'overview',
  alerts: [],
  notifications: [],
  simulationParams: {},
  // ... more
}
```

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.26.0",
    "recharts": "^2.15.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.468.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

## 🏃 Getting Started

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
# Opens http://localhost:5173
```

### Build
```bash
npm run build
# Outputs to dist/
```

### Preview
```bash
npm run preview
# Preview production build locally
```

## 🎨 Customization

### Theme Colors
Edit `src/index.css` CSS variables:
```css
:root {
  --color-primary-500: #6366f1;  /* Primary brand color */
  --color-surface-800: #1e293b;  /* Card background */
  /* ... */
}
```

### Animation Speed
Adjust Framer Motion `transition` duration in components.

## 🐛 Troubleshooting

### Module Resolution Issues
If you see import errors, ensure:
- All paths use relative imports (`../components/...`)
- No circular dependencies exist
- Vite cache cleared (`rm -rf node_modules/.vite`)

### Build Errors
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📈 Future Roadmap

- [ ] **Explainable AI**: SHAP & LIME integration
- [ ] **Collaboration**: Share reports via email/Slack
- [ ] **API Gateway**: RESTful API for fairness checks
- [ ] **MLflow Integration**: Model versioning & tracking
- [ ] **Bias Benchmarks**: Compare against industry standards
- [ ] **Automated Remediation**: Auto-fix suggestions
- [ ] **Real-time Monitoring**: Live fairness dashboards
- [ ] **Multi-tenancy**: SaaS multi-user support

## 🤝 Contributing

This is a production-grade template. Feel free to:
- Fork and customize
- Add new debiasing algorithms
- Extend chart library
- Improve accessibility (WCAG 2.1 AA target)

## 📄 License

MIT - Feel free to use in production projects.

## 🙏 Credits

Built with ❤ using modern React ecosystem tools:
- [Vite](https://vitejs.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Recharts](https://recharts.org/)
- [Zustand](https://github.com/pmndrs/zustand)

---

**Ready for hackathon demo** 🚀

This dashboard demonstrates enterprise-level React development with:
- ✅ TypeScript-ready architecture
- ✅ Comprehensive state management
- ✅ Testable component structure
- ✅ Production build optimized
- ✅ Mobile-first responsive design
- ✅ Accessibility-ready ARIA labels
- ✅ Beautiful UI/UX design system