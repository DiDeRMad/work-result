import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AnimatePresence } from 'framer-motion';

// Store and theme
import { store } from './store';
import { gameTheme } from './styles/theme';

// Hooks
import { useAuth } from './hooks/useAuth';
import { useSocket } from './hooks/useSocket';
import { useGameEngine } from './hooks/useGameEngine';

// Components
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import GameLayout from './components/GameLayout';

// Lazy loaded pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CharacterSelect = lazy(() => import('./pages/CharacterSelect'));
const CharacterCreate = lazy(() => import('./pages/CharacterCreate'));
const GameWorld = lazy(() => import('./pages/GameWorld'));
const Settings = lazy(() => import('./pages/Settings'));
const Shop = lazy(() => import('./pages/Shop'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Main App Component
const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { connect, disconnect } = useSocket();
  const { initializeEngine, destroyEngine } = useGameEngine();

  useEffect(() => {
    // Initialize game engine
    initializeEngine();

    // Connect socket if authenticated
    if (isAuthenticated) {
      connect();
    }

    // Cleanup
    return () => {
      disconnect();
      destroyEngine();
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={gameTheme}>
            <DndProvider backend={HTML5Backend}>
              <CssBaseline />
              <Router>
                <AnimatePresence mode="wait">
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Protected routes */}
                      <Route element={<PrivateRoute />}>
                        <Route element={<GameLayout />}>
                          <Route path="/characters" element={<CharacterSelect />} />
                          <Route path="/characters/create" element={<CharacterCreate />} />
                          <Route path="/world" element={<GameWorld />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/shop" element={<Shop />} />
                        </Route>
                      </Route>

                      {/* Default redirect */}
                      <Route
                        path="/"
                        element={
                          <Navigate to={isAuthenticated ? '/characters' : '/login'} replace />
                        }
                      />
                    </Routes>
                  </Suspense>
                </AnimatePresence>
              </Router>

              {/* Global components */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#1a1a2e',
                    color: '#fff',
                    border: '1px solid #16213e',
                  },
                  success: {
                    iconTheme: {
                      primary: '#4caf50',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#f44336',
                      secondary: '#fff',
                    },
                  },
                }}
              />

              {/* React Query Devtools */}
              {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
              )}
            </DndProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
};

export default App;