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
import { ProfilePage } from './pages/ProfilePage';

function App() {
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