import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectRole from './components/SelectRole';
import Login from './components/Login';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import HostDashboard from './components/HostDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectRole />} />
        <Route path="/login/:userType" element={<Login />} />
        <Route path="/register/:userType" element={<Register />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/host-dashboard" element={<HostDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;