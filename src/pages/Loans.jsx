import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, X, Calendar, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { loanAPI, customerAPI } from '../services/api';
import { formatCurrency, formatDate, getLoanStatusBadge, calculateDaysBetween } from '../utils/helpers';
import toast from 'react-hot-toast';

const Loans = () => {
    const [loans, setLoans] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedLoan, setSelectedLoan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterType, setFilterType] = useState('');

    const [formData, setFormData] = useState({
        customerId: '',
        principalAmount: '',
        interestType: 'daily',
        interestRate: '',
        disbursementDate: '',
        dueDate: '',
        notes: ''
    });

    useEffect(() => {
        fetchLoans();
        fetchCustomers();
    }, [filterStatus, filterType]);

    const fetchLoans = async () => {
        try {
            setLoading(true);
            const params = {};
            if (filterStatus) params.status = filterStatus;
            if (filterType) params.interestType = filterType;

            const response = await loanAPI.getAll(params);
            setLoans(response.data.data);
        } catch (error) {
            console.error('Error fetching loans:', error);
            toast.error('Failed to load loans');
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const response = await customerAPI.getAll({ limit: 1000 });
            setCustomers(response.data.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await loanAPI.create(formData);
            toast.success('Loan created successfully');
            setShowModal(false);
            resetForm();
            fetchLoans();
        } catch (error) {
            console.error('Error creating loan:', error);
            toast.error(error.response?.data?.message || 'Failed to create loan');
        }
    };

    const handleViewLoan = async (loan) => {
        try {
            const response = await loanAPI.getById(loan._id);
            setSelectedLoan(response.data.data);
        } catch (error) {
            console.error('Error fetching loan details:', error);
            toast.error('Failed to load loan details');
        }
    };

    const resetForm = () => {
        setFormData({
            customerId: '',
            principalAmount: '',
            interestType: 'daily',
            interestRate: '',
            disbursementDate: '',
            dueDate: '',
            notes: ''
        });
    };

    const filteredLoans = loans.filter(loan => {
        const matchesSearch = loan.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            loan.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="loans-page fade-in">
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">Loans Management</h1>
                    <p className="page-subtitle">Manage all loans with daily and monthly interest calculations</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    <Plus size={20} />
                    New Loan
                </button>
            </div>

            {/* Filters */}
            <div className="card mb-2">
                <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                    <div className="form-group" style={{ flex: '1', minWidth: '250px', marginBottom: 0 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Search by Loan ID or Customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ paddingLeft: '40px' }}
                            />
                        </div>
                    </div>
                    <select
                        className="form-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ minWidth: '150px' }}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="defaulted">Defaulted</option>
                    </select>
                    <select
                        className="form-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ minWidth: '150px' }}
                    >
                        <option value="">All Types</option>
                        <option value="daily">Daily Interest</option>
                        <option value="monthly">Monthly Interest</option>
                    </select>
                </div>
            </div>

            {/* Loans Table */}
            {loading ? (
                <div className="flex-center" style={{ minHeight: '400px' }}>
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Loan ID</th>
                                <th>Customer</th>
                                <th>Principal</th>
                                <th>Interest Type</th>
                                <th>Rate (%)</th>
                                <th>Disbursement</th>
                                <th>Outstanding</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLoans.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center" style={{ padding: '3rem' }}>
                                        <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                        <p className="text-muted">No loans found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLoans.map((loan) => (
                                    <tr key={loan._id}>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                                                {loan.loanId}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                                                {loan.loanTypeCode === 'D' ? 'Daily' : 'Monthly'}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{loan.customer?.name}</div>
                                            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-tertiary)' }}>
                                                {loan.customer?.customerId}
                                            </div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{formatCurrency(loan.principalAmount)}</td>
                                        <td>
                                            <span className={`badge ${loan.interestType === 'daily' ? 'badge-info' : 'badge-warning'}`}>
                                                {loan.interestType}
                                            </span>
                                        </td>
                                        <td>{loan.interestRate}%</td>
                                        <td>{formatDate(loan.disbursementDate)}</td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--color-warning)' }}>
                                                {formatCurrency(loan.totalOutstanding || (loan.outstandingPrincipal + (loan.currentInterest || 0)))}
                                            </div>
                                            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                                                P: {formatCurrency(loan.outstandingPrincipal)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getLoanStatusBadge(loan.status)}`}>
                                                {loan.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-secondary"
                                                onClick={() => handleViewLoan(loan)}
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Loan Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create New Loan</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Customer *</label>
                                    <select
                                        className="form-select"
                                        value={formData.customerId}
                                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Customer</option>
                                        {customers.map(customer => (
                                            <option key={customer._id} value={customer.customerId}>
                                                {customer.name} ({customer.customerId})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Principal Amount *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.principalAmount}
                                            onChange={(e) => setFormData({ ...formData, principalAmount: e.target.value })}
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Interest Type *</label>
                                        <select
                                            className="form-select"
                                            value={formData.interestType}
                                            onChange={(e) => setFormData({ ...formData, interestType: e.target.value })}
                                            required
                                        >
                                            <option value="daily">Daily (Vatti)</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Interest Rate (%) *</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.interestRate}
                                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Disbursement Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.disbursementDate}
                                            onChange={(e) => setFormData({ ...formData, disbursementDate: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Due Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Loan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Loan Details Modal */}
            {selectedLoan && (
                <div className="modal-overlay" onClick={() => setSelectedLoan(null)}>
                    <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h2>Loan Details</h2>
                                <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '0.25rem' }}>
                                    {selectedLoan.loan.loanId}
                                </p>
                            </div>
                            <button className="btn-icon" onClick={() => setSelectedLoan(null)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Loan Info Grid */}
                            <div className="grid grid-3 mb-3">
                                <div className="stat-card">
                                    <div className="stat-label">Principal Amount</div>
                                    <div className="stat-value" style={{ fontSize: 'var(--font-size-xl)' }}>
                                        {formatCurrency(selectedLoan.loan.principalAmount)}
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Outstanding Principal</div>
                                    <div className="stat-value" style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-warning)' }}>
                                        {formatCurrency(selectedLoan.loan.outstandingPrincipal)}
                                    </div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Current Interest</div>
                                    <div className="stat-value" style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-success)' }}>
                                        {formatCurrency(selectedLoan.loan.currentInterest || 0)}
                                    </div>
                                </div>
                            </div>

                            {/* Payment History */}
                            <div className="card">
                                <div className="card-header">
                                    <h3 className="card-title">Payment History</h3>
                                </div>
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Payment ID</th>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Principal</th>
                                                <th>Interest</th>
                                                <th>Method</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedLoan.payments && selectedLoan.payments.length > 0 ? (
                                                selectedLoan.payments.map(payment => (
                                                    <tr key={payment._id}>
                                                        <td>{payment.paymentId}</td>
                                                        <td>{formatDate(payment.paymentDate)}</td>
                                                        <td style={{ fontWeight: 700 }}>{formatCurrency(payment.amount)}</td>
                                                        <td>{formatCurrency(payment.principalPaid)}</td>
                                                        <td>{formatCurrency(payment.interestPaid)}</td>
                                                        <td>
                                                            <span className="badge badge-info">{payment.paymentMethod}</span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center text-muted">No payments yet</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Styles - Moved to index.css */}
        </div>
    );
};

export default Loans;
