import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { AlertBanner } from './AnimationUtils';

export default function AlertSystem() {
  const { alerts, removeAlert } = useAppStore();

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {alerts.map((alert) => (
          <AlertBanner
            key={alert.id}
            alert={alert}
            onDismiss={removeAlert}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}