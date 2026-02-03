import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import {
    LayoutDashboard,
    Users,
    FileText,
    CreditCard,
    TrendingUp,
    X
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import './index.css';

const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/loans', icon: FileText, label: 'Loans' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
];

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();

    return (
        <>
            <div
                className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
                onClick={onClose}
            ></div>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                <div className="sidebar-header flex-between">
                    <div className="logo">
                        <TrendingUp size={32} />
                        <span>FinanceLend</span>
                    </div>
                    <button className="btn-icon mobile-only" onClick={onClose}>
                        <X size={24} />
                    </button>
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
                                        onClick={() => window.innerWidth < 768 && onClose()}
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
        </>
    );
};

const BottomNav = () => {
    const location = useLocation();

    return (
        <nav className="bottom-nav mobile-only">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`bottom-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Router>
            <div className="app">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

                <main className="main-content">
                    {/* Mobile Header */}
                    <div className="mobile-header mobile-only">
                        <div style={{ width: 24 }}></div>
                        <div className="logo-small">
                            <TrendingUp size={24} />
                            <span>FinanceLend</span>
                        </div>
                        <div style={{ width: 24 }}></div> {/* Spacer for center alignment */}
                    </div>

                    <div className="content-wrapper">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/loans" element={<Loans />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/payments" element={<Payments />} />
                        </Routes>
                    </div>

                    <BottomNav />
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
