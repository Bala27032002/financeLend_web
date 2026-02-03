import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, DollarSign, CreditCard, ArrowRight, X, TrendingUp, TrendingDown } from 'lucide-react';
import { paymentAPI, loanAPI, customerAPI } from '../services/api';
import { formatCurrency, formatDate, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [loans, setLoans] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loansLoading, setLoansLoading] = useState(false);

    const [formData, setFormData] = useState({
        loanId: '',
        amount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'cash',
        transactionReference: '',
        notes: ''
    });

    const [selectedLoanDetails, setSelectedLoanDetails] = useState(null);

    useEffect(() => {
        fetchPayments();
    }, []);

    useEffect(() => {
        if (showModal) {
            fetchActiveLoans();
        }
    }, [showModal]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await paymentAPI.getAll({ limit: 100 });
            setPayments(response.data.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveLoans = async () => {
        try {
            setLoansLoading(true);
            const response = await loanAPI.getAll({ status: 'active', limit: 1000 });
            setLoans(response.data.data);
        } catch (error) {
            console.error('Error fetching loans:', error);
        } finally {
            setLoansLoading(false);
        }
    };

    const handleLoanSelect = async (e) => {
        const selectedLoanId = e.target.value;
        setFormData({ ...formData, loanId: selectedLoanId });

        if (selectedLoanId) {
            try {
                const loan = loans.find(l => l.loanId === selectedLoanId);
                if (loan) {
                    // Fetch calculation details for today
                    const calcRes = await loanAPI.calculate(loan._id, { asOfDate: new Date() });
                    setSelectedLoanDetails(calcRes.data.data);
                }
            } catch (error) {
                console.error('Error calculating loan details:', error);
            }
        } else {
            setSelectedLoanDetails(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await paymentAPI.create(formData);
            toast.success('Payment recorded successfully');
            setShowModal(false);
            resetForm();
            fetchPayments();
        } catch (error) {
            console.error('Error creating payment:', error);
            toast.error(error.response?.data?.message || 'Failed to record payment');
        }
    };

    const resetForm = () => {
        setFormData({
            loanId: '',
            amount: '',
            paymentDate: new Date().toISOString().split('T')[0],
            paymentMethod: 'cash',
            transactionReference: '',
            notes: ''
        });
        setSelectedLoanDetails(null);
    };

    const filteredPayments = payments.filter(payment => {
        return (
            payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.loanId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="payments-page fade-in">
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">Payments</h1>
                    <p className="page-subtitle">Track and manage all loan repayments</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <Plus size={20} />
                    Record Payment
                </button>
            </div>

            {/* Search Toolbar */}
            <div className="card mb-2">
                <div className="form-group mb-0 relative">
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by Payment ID, Loan ID, or Customer Name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ paddingLeft: '40px' }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex-center" style={{ minHeight: '400px' }}>
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Payment ID</th>
                                <th>Date</th>
                                <th>Run By (User) - Customer</th>
                                <th>Loan Reference</th>
                                <th>Amount Paid</th>
                                <th>Principal / Interest</th>
                                <th>Method</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPayments.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center" style={{ padding: '3rem' }}>
                                        <CreditCard size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                        <p className="text-muted">No payments found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPayments.map((payment) => (
                                    <tr key={payment._id}>
                                        <td style={{ fontWeight: 600 }}>{payment.paymentId}</td>
                                        <td>{formatDate(payment.paymentDate)}</td>
                                        <td>
                                            <div className="flex align-center gap-1">
                                                <div style={{ fontWeight: 600 }}>{payment.customer?.name}</div>
                                            </div>
                                            <div className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>
                                                {payment.customerId}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{payment.loanId}</div>
                                        </td>
                                        <td style={{ fontWeight: 700, fontSize: 'var(--font-size-lg)' }}>
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <div style={{ fontSize: 'var(--font-size-xs)', display: 'flex', justifyContent: 'space-between', width: '120px' }}>
                                                    <span className="text-muted">Prin:</span>
                                                    <span style={{ color: 'var(--color-success)' }}>{formatCurrency(payment.principalPaid)}</span>
                                                </div>
                                                <div style={{ fontSize: 'var(--font-size-xs)', display: 'flex', justifyContent: 'space-between', width: '120px' }}>
                                                    <span className="text-muted">Int:</span>
                                                    <span style={{ color: 'var(--color-warning)' }}>{formatCurrency(payment.interestPaid)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="badge badge-info uppercase">{payment.paymentMethod}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${payment.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Record Payment Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Record Payment</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Select Loan *</label>
                                    <select
                                        className="form-select"
                                        value={formData.loanId}
                                        onChange={handleLoanSelect}
                                        required
                                        disabled={loansLoading}
                                    >
                                        <option value="">{loansLoading ? 'Loading loans...' : 'Select Loan'}</option>
                                        {loans.map(loan => (
                                            <option key={loan._id} value={loan.loanId}>
                                                {loan.loanId} - {loan.customer?.name} - {formatCurrency(loan.totalOutstanding)} Due
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedLoanDetails && (
                                    <div className="card-glass p-3 mb-3" style={{ borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md)' }}>
                                        <div className="grid grid-2 gap-2">
                                            <div>
                                                <div className="text-muted text-xs">Principal Due</div>
                                                <div style={{ fontWeight: 700 }}>{formatCurrency(selectedLoanDetails.outstandingPrincipal)}</div>
                                            </div>
                                            <div>
                                                <div className="text-muted text-xs">Interest Due</div>
                                                <div style={{ fontWeight: 700, color: 'var(--color-warning)' }}>{formatCurrency(selectedLoanDetails.calculatedInterest)}</div>
                                            </div>
                                            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--glass-border)' }}>
                                                <div className="text-muted text-xs">Total Outstanding</div>
                                                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-danger)' }}>
                                                    {formatCurrency(selectedLoanDetails.totalOutstanding)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Payment Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={formData.paymentDate}
                                            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Amount Received *</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            required
                                            min="1"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Payment Method *</label>
                                    <select
                                        className="form-select"
                                        value={formData.paymentMethod}
                                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                        required
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="upi">UPI</option>
                                        <option value="cheque">Cheque</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Transaction Reference (Optional)</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.transactionReference}
                                        onChange={(e) => setFormData({ ...formData, transactionReference: e.target.value })}
                                        placeholder="e.g. UPI Ref ID, Cheque No"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <textarea
                                        className="form-textarea"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows="2"
                                    />
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={!formData.loanId}>
                                    Record Payment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: var(--spacing-lg);
        }

        .modal-content {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
        }

        .modal-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--color-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: var(--font-size-xl);
        }

        .modal-body {
          padding: var(--spacing-lg);
        }

        .modal-footer {
          padding: var(--spacing-lg);
          border-top: 1px solid var(--color-border);
          display: flex;
          justify-content: flex-end;
          gap: var(--spacing-sm);
        }

        .btn-icon {
          background: none;
          border: none;
          color: var(--color-text-secondary);
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
          transition: all var(--transition-fast);
        }

        .btn-icon:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .text-xs { font-size: 0.75rem; }
      `}</style>
        </div>
    );
};

export default Payments;
