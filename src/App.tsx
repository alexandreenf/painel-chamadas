import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueueProvider } from './contexts/QueueContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './components/Login';
import { AttendantPage } from './pages/AttendantPage';
import { CallPanel } from './pages/CallPanel';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <QueueProvider>
      <Router>
        <Routes>
          <Route path="/panel" element={<CallPanel />} />
          <Route 
            path="/attendant" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'attendant']}>
                <AttendantPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/attendant\" replace />} />
        </Routes>
      </Router>
    </QueueProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  );
}

export default App;