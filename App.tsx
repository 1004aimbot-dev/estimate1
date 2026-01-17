import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EstimateList } from './pages/EstimateList';
import { EstimateDetail } from './pages/EstimateDetail';
import { EstimateForm } from './pages/EstimateForm';
import { SuccessPage } from './pages/SuccessPage';
import { Library } from './pages/Library';
import { BulkUpload } from './pages/BulkUpload';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<EstimateList />} />
        <Route path="/estimate/:id" element={<EstimateDetail />} />
        <Route path="/form" element={<EstimateForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/library" element={<Library />} />
        <Route path="/bulk-upload" element={<BulkUpload />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;