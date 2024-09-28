import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import Signup from './pages/signup.jsx';
import Login from './pages/login.jsx';
import Dashboard from './pages/dashboard.jsx';
import './styles/globals.css';
import { AuthProvider } from './libs/authProvider.jsx';
import ProtectedRoute from './libs/protectedRoute.jsx';
import Setting from './pages/setting.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/setting" element={<ProtectedRoute element={<Setting />} />} />
        </Routes>
      </Router>
    </AuthProvider>
  </StrictMode>,
);
