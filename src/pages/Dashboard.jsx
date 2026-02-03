import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    FileText,
    CreditCard,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { loanAPI, customerAPI, paymentAPI } from '../services/api';
import { formatCurrency, formatNumber } from '../utils/helpers';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState({
        loans: null,
        customers: null,
        payments: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [loansRes, customersRes, paymentsRes] = await Promise.all([
                loanAPI.getStats(),
                customerAPI.getStats(),
                paymentAPI.getStats()
            ]);

            setStats({
                loans: loansRes.data.data,
                customers: customersRes.data.data,
                payments: paymentsRes.data.data
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '60vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    const { loans, customers, payments } = stats;

    // Chart colors
    const COLORS = ['hsl(240, 100%, 65%)', 'hsl(280, 80%, 60%)', 'hsl(142, 76%, 45%)', 'hsl(0, 84%, 60%)'];

    // Loan distribution data
    const loanDistribution = [
        { name: 'Active', value: loans?.activeLoans || 0 },
        { name: 'Closed', value: loans?.closedLoans || 0 },
        { name: 'Defaulted', value: loans?.defaultedLoans || 0 }
    ];

    // Interest type data
    const interestTypeData = [
        { name: 'Daily', value: loans?.dailyLoans || 0 },
        { name: 'Monthly', value: loans?.monthlyLoans || 0 }
    ];

    return (
        <div className="dashboard fade-in">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Overview of your finance lending business</p>
            </div>

            {/* Key Metrics */}
            <div className="stats-grid">
                {/* Total Principal Disbursed */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Total Disbursed</div>
                            <div className="stat-value">{formatCurrency(loans?.totalPrincipalDisbursed || 0)}</div>
                        </div>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, hsl(240, 100%, 65%), hsl(280, 80%, 60%))' }}>
                            <DollarSign color="white" />
                        </div>
                    </div>
                    <div className="stat-change positive">
                        <TrendingUp size={16} />
                        <span>{formatNumber(loans?.totalLoans || 0)} Total Loans</span>
                    </div>
                </div>

                {/* Outstanding Principal */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Outstanding Principal</div>
                            <div className="stat-value">{formatCurrency(loans?.totalOutstandingPrincipal || 0)}</div>
                        </div>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, hsl(38, 92%, 50%), hsl(38, 92%, 40%))' }}>
                            <AlertCircle color="white" />
                        </div>
                    </div>
                    <div className="stat-change">
                        <span className="text-muted">{formatNumber(loans?.activeLoans || 0)} Active Loans</span>
                    </div>
                </div>

                {/* Total Interest Earned */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Interest Earned</div>
                            <div className="stat-value">{formatCurrency(loans?.totalInterestEarned || 0)}</div>
                        </div>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, hsl(142, 76%, 45%), hsl(142, 76%, 35%))' }}>
                            <TrendingUp color="white" />
                        </div>
                    </div>
                    <div className="stat-change positive">
                        <TrendingUp size={16} />
                        <span>Outstanding: {formatCurrency(loans?.totalOutstandingInterest || 0)}</span>
                    </div>
                </div>

                {/* Net Profit/Loss */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Net Profit/Loss</div>
                            <div className="stat-value" style={{
                                background: loans?.netProfitLoss >= 0 ? 'linear-gradient(135deg, hsl(142, 76%, 45%), hsl(142, 76%, 35%))' : 'linear-gradient(135deg, hsl(0, 84%, 60%), hsl(0, 84%, 50%))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {formatCurrency(loans?.netProfitLoss || 0)}
                            </div>
                        </div>
                        <div className="stat-icon" style={{
                            background: loans?.netProfitLoss >= 0 ? 'linear-gradient(135deg, hsl(142, 76%, 45%), hsl(142, 76%, 35%))' : 'linear-gradient(135deg, hsl(0, 84%, 60%), hsl(0, 84%, 50%))'
                        }}>
                            {loans?.netProfitLoss >= 0 ? <TrendingUp color="white" /> : <TrendingDown color="white" />}
                        </div>
                    </div>
                    <div className={`stat-change ${loans?.netProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                        {loans?.netProfitLoss >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        <span>Profit: {formatCurrency(loans?.totalProfit || 0)}</span>
                    </div>
                </div>

                {/* Total Customers */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Total Customers</div>
                            <div className="stat-value">{formatNumber(customers?.totalCustomers || 0)}</div>
                        </div>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, hsl(199, 89%, 48%), hsl(199, 89%, 38%))' }}>
                            <Users color="white" />
                        </div>
                    </div>
                    <div className="stat-change">
                        <span className="text-muted">{formatNumber(customers?.activeCustomers || 0)} Active</span>
                    </div>
                </div>

                {/* Total Payments */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Total Payments</div>
                            <div className="stat-value">{formatCurrency(payments?.totalAmountReceived || 0)}</div>
                        </div>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, hsl(320, 85%, 65%), hsl(320, 85%, 55%))' }}>
                            <CreditCard color="white" />
                        </div>
                    </div>
                    <div className="stat-change positive">
                        <TrendingUp size={16} />
                        <span>{formatNumber(payments?.totalPayments || 0)} Transactions</span>
                    </div>
                </div>

                {/* Today's Collections */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Today's Collections</div>
                            <div className="stat-value">{formatCurrency(payments?.todayAmount || 0)}</div>
                        </div>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, hsl(142, 76%, 45%), hsl(142, 76%, 35%))' }}>
                            <Calendar color="white" />
                        </div>
                    </div>
                    <div className="stat-change">
                        <span className="text-muted">{formatNumber(payments?.todayPayments || 0)} Payments</span>
                    </div>
                </div>

                {/* Active Loans */}
                <div className="stat-card">
                    <div className="stat-header">
                        <div>
                            <div className="stat-label">Active Loans</div>
                            <div className="stat-value">{formatNumber(loans?.activeLoans || 0)}</div>
                        </div>
                        <div className="stat-icon" style={{ background: 'linear-gradient(135deg, hsl(240, 100%, 65%), hsl(280, 80%, 60%))' }}>
                            <FileText color="white" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-muted">Daily: {formatNumber(loans?.dailyLoans || 0)}</span>
                        <span className="text-muted">Monthly: {formatNumber(loans?.monthlyLoans || 0)}</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-2 mt-3">
                {/* Loan Distribution */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Loan Distribution</h3>
                    </div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={loanDistribution}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {loanDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Interest Type Distribution */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Interest Type Distribution</h3>
                    </div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={interestTypeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 25%)" />
                                <XAxis dataKey="name" stroke="hsl(0, 0%, 70%)" />
                                <YAxis stroke="hsl(0, 0%, 70%)" />
                                <Tooltip
                                    contentStyle={{
                                        background: 'hsl(220, 18%, 14%)',
                                        border: '1px solid hsl(220, 18%, 25%)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="value" fill="hsl(240, 100%, 65%)" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Financial Summary */}
            <div className="card mt-3">
                <div className="card-header">
                    <h3 className="card-title">Financial Summary</h3>
                </div>
                <div className="card-body">
                    <div className="grid grid-3">
                        <div>
                            <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                Principal Disbursed
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
                                {formatCurrency(loans?.totalPrincipalDisbursed || 0)}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                Principal Outstanding
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'hsl(38, 92%, 50%)' }}>
                                {formatCurrency(loans?.totalOutstandingPrincipal || 0)}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                Principal Recovered
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'hsl(142, 76%, 45%)' }}>
                                {formatCurrency((loans?.totalPrincipalDisbursed || 0) - (loans?.totalOutstandingPrincipal || 0))}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                Interest Earned
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'hsl(142, 76%, 45%)' }}>
                                {formatCurrency(loans?.totalInterestEarned || 0)}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                Interest Outstanding
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'hsl(38, 92%, 50%)' }}>
                                {formatCurrency(loans?.totalOutstandingInterest || 0)}
                            </div>
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
                                Total Collections
                            </div>
                            <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'hsl(142, 76%, 45%)' }}>
                                {formatCurrency(payments?.totalAmountReceived || 0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
