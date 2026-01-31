import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Dashboard } from '@/pages/Dashboard';
import { Landing } from '@/pages/Landing';
import { Pricing } from '@/pages/Pricing';
import { Contact } from '@/pages/Contact';
import { Leads } from '@/pages/Leads';
import { Settings } from '@/pages/Settings';
import { Area } from '@/pages/Area';

// NavTabs removed as per user request to use BernardDock only

function AppContent() {
    return (
        <>
            {/* NavTabs removed */}
            <Routes>
                <Route path="/" element={<Navigate to="/landing" replace />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/leads" element={<Layout><Leads /></Layout>} />
                <Route path="/area" element={<Layout><Area /></Layout>} />
                <Route path="/settings" element={<Layout><Settings /></Layout>} />
            </Routes>
        </>
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
