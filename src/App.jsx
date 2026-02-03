import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
    LayoutDashboard,
    Users,
    FileText,
    CreditCard,
    TrendingUp
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import './index.css';

const Sidebar = () => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/loans', icon: FileText, label: 'Loans' },
        { path: '/customers', icon: Users, label: 'Customers' },
        { path: '/payments', icon: CreditCard, label: 'Payments' },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <TrendingUp size={32} />
                    <span>FinanceLend</span>
                </div>
            </div>
            <nav>
                <ul className="nav-menu">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path} className="nav-item">
                                <Link
                                    to={item.path}
                                    className={`nav-link ${isActive ? 'active' : ''}`}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </div>
    );
};

function App() {
    return (
        <Router>
            <div className="app">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/loans" element={<Loans />} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/payments" element={<Payments />} />
                    </Routes>
                </main>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: 'hsl(220, 18%, 14%)',
                            color: 'hsl(0, 0%, 98%)',
                            border: '1px solid hsl(220, 18%, 25%)',
                            borderRadius: 'var(--radius-md)',
                        },
                        success: {
                            iconTheme: {
                                primary: 'hsl(142, 76%, 45%)',
                                secondary: 'hsl(220, 18%, 14%)',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: 'hsl(0, 84%, 60%)',
                                secondary: 'hsl(220, 18%, 14%)',
                            },
                        },
                    }}
                />
            </div>
        </Router>
    );
}

export default App;
