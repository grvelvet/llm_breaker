import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Workspace } from './components/Workspace';
import { SettingsPanel } from './components/SettingsPanel';
import { HistoryModal } from './components/HistoryModal';

function AppContent() {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const { isDarkMode } = useApp();

  // Ensure documentElement has 'dark' class synced with state
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-expand settings sidebar by default on desktop viewports
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSettingsOpen(true);
    }
  }, []);

  return (
    <>
      <Toaster position="bottom-right" />
      <div className="h-[100dvh] w-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-250 antialiased font-sans">
        <div className="flex-1 h-full flex flex-col max-w-7xl w-full mx-auto px-4 md:px-6 lg:px-8 pb-1 md:pb-1 min-h-0 safe-pt">
          
          {/* Header Bar */}
          <Header
            onOpenSettings={() => setIsSettingsOpen((prev) => !prev)}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />

          {/* Main Layout containing Workspace editor and Sidebar parameters */}
          <main className="flex-1 flex flex-col md:flex-row gap-4 md:gap-5 mt-2 md:mt-3 min-h-0 relative">
            {/* Interactive Editors (Input & Output) */}
            <Workspace />

            {/* Configuration side panel */}
            <SettingsPanel
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />
          </main>

          {/* Footer Bar */}
          <footer className="py-0.5 flex justify-center items-center flex-shrink-0 select-none mt-1">
            <span className="text-[10px] font-medium text-slate-400/70 dark:text-slate-500/70 tracking-wider">
              created by <span className="font-semibold text-slate-500/90 dark:text-slate-400/90 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">nah</span>
            </span>
          </footer>

          {/* Native generator history logger */}
          <HistoryModal
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
          />

        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
