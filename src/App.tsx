import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { StoryPage } from './pages/StoryPage';
import { ShotListPage } from './pages/ShotListPage';
import { PhotoboardPage } from './pages/PhotoboardPage';
import { ExportPage } from './pages/ExportPage';
import { PricingPage } from './pages/PricingPage';
import { PaymentPage } from './pages/PaymentPage';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { ProfilePage } from './pages/ProfilePage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { loading, initialized } = useAuth();

  // Show loading screen while auth is initializing
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Initializing CineSpark AI...</p>
          <p className="text-gray-500 text-sm mt-2">Setting up your creative workspace</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/story/:projectId" element={<StoryPage />} />
          <Route path="/shots/:projectId" element={<ShotListPage />} />
          <Route path="/photoboard/:projectId" element={<PhotoboardPage />} />
          <Route path="/export/:projectId" element={<ExportPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/payment/:planId" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#fff',
              border: '1px solid #374151',
            },
          }}
        />
      </Layout>
    </Router>
  );
}

export default App;