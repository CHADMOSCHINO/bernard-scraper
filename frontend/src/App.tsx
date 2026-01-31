import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Landing } from '@/pages/Landing';
import { Pricing } from '@/pages/Pricing';
import { Contact } from '@/pages/Contact';
import { Leads } from '@/pages/Leads';
import { Settings } from '@/pages/Settings';
import { Area } from '@/pages/Area';
import { Login } from '@/pages/Login';
import { Outreach } from '@/pages/Outreach';

// Simple Auth Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = localStorage.getItem('chauncey_auth') === 'true';
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function AppContent() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/landing" replace />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/leads" element={<ProtectedRoute><Layout><Leads /></Layout></ProtectedRoute>} />
            <Route path="/outreach" element={<ProtectedRoute><Layout><Outreach /></Layout></ProtectedRoute>} />
            <Route path="/area" element={<ProtectedRoute><Layout><Area /></Layout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
        </Routes>
    )
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
