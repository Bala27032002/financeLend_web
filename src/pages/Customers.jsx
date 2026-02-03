import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Phone, MapPin, User, FileText, X } from 'lucide-react';
import { customerAPI } from '../services/api';
import { formatDate, formatDateTime, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const Customers = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCustomer, setEditingCustomer] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        aadharNumber: '',
        panNumber: '',
        address: {
            street: '',
            city: '',
            state: '',
            pincode: ''
        }
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await customerAPI.getAll({ limit: 100 });
            setCustomers(response.data.data);
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            phone: customer.phone,
            email: customer.email || '',
            aadharNumber: customer.aadharNumber || '',
            panNumber: customer.panNumber || '',
            address: {
                street: customer.address?.street || '',
                city: customer.address?.city || '',
                state: customer.address?.state || '',
                pincode: customer.address?.pincode || ''
            }
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
            try {
                await customerAPI.delete(id);
                toast.success('Customer deleted successfully');
                fetchCustomers();
            } catch (error) {
                console.error('Error deleting customer:', error);
                toast.error(error.response?.data?.message || 'Failed to delete customer');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCustomer) {
                await customerAPI.update(editingCustomer._id, formData);
                toast.success('Customer updated successfully');
            } else {
                await customerAPI.create(formData);
                toast.success('Customer created successfully');
            }
            setShowModal(false);
            resetForm();
            fetchCustomers();
        } catch (error) {
            console.error('Error saving customer:', error);
            toast.error(error.response?.data?.message || 'Failed to save customer');
        }
    };

    const resetForm = () => {
        setEditingCustomer(null);
        setFormData({
            name: '',
            phone: '',
            email: '',
            aadharNumber: '',
            panNumber: '',
            address: {
                street: '',
                city: '',
                state: '',
                pincode: ''
            }
        });
    };

    const filteredCustomers = customers.filter(customer => {
        return (
            customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone?.includes(searchTerm) ||
            customer.customerId?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="customers-page fade-in">
            <div className="page-header flex-between">
                <div>
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle">Manage customer profiles and KYC details</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <Plus size={20} />
                    New Customer
                </button>
            </div>

            {/* Search Toolbar */}
            <div className="card mb-2">
                <div className="form-group mb-0 relative">
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by Name, Phone, or Customer ID..."
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
                <div className="grid grid-3">
                    {filteredCustomers.length === 0 ? (
                        <div className="text-center" style={{ gridColumn: '1 / -1', padding: '3rem' }}>
                            <User size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p className="text-muted">No customers found</p>
                        </div>
                    ) : (
                        filteredCustomers.map((customer) => (
                            <div key={customer._id} className="card customer-card">
                                <div className="card-header flex-between">
                                    <div className="flex gap-2">
                                        <div className="avatar">
                                            {getInitials(customer.name)}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: 'var(--font-size-lg)', margin: 0 }}>{customer.name}</h3>
                                            <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
                                                {customer.customerId}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`status-dot ${customer.status === 'active' ? 'active' : 'inactive'}`}></div>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <Phone size={16} className="text-muted" />
                                        <span>{customer.phone}</span>
                                    </div>
                                    <div className="info-row">
                                        <MapPin size={16} className="text-muted" />
                                        <span>{customer.address?.city || 'No City'}, {customer.address?.state || 'No State'}</span>
                                    </div>

                                    <div className="stats-mini-grid mt-2">
                                        <div className="stat-mini">
                                            <div className="label">Active Loans</div>
                                            <div className="value">{customer.activeLoans}</div>
                                        </div>
                                        <div className="stat-mini">
                                            <div className="label">Total Loans</div>
                                            <div className="value">{customer.totalLoans}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card-footer flex justify-end gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <button className="btn-icon" onClick={() => handleEdit(customer)} title="Edit">
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        className="btn-icon text-danger"
                                        onClick={() => handleDelete(customer._id)}
                                        title="Delete"
                                        disabled={customer.activeLoans > 0}
                                        style={{ opacity: customer.activeLoans > 0 ? 0.5 : 1, cursor: customer.activeLoans > 0 ? 'not-allowed' : 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingCustomer ? 'Edit Customer' : 'New Customer'}</h2>
                            <button className="btn-icon" onClick={() => setShowModal(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            required
                                            pattern="[6-9][0-9]{9}"
                                            title="Please enter valid 10 digit number"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Aadhar Number</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.aadharNumber}
                                            onChange={(e) => setFormData({ ...formData, aadharNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">PAN Number</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.panNumber}
                                            onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                                            style={{ textTransform: 'uppercase' }}
                                        />
                                    </div>
                                </div>

                                <h4 className="mt-2 mb-1">Address Details</h4>
                                <div className="form-group">
                                    <label className="form-label">Street Address</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.address.street}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })}
                                    />
                                </div>

                                <div className="grid grid-3">
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.address.city}
                                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.address.state}
                                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Pincode</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={formData.address.pincode}
                                            onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingCustomer ? 'Update Customer' : 'Create Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Styles moved to index.css */}
        </div>
    );
};

export default Customers;
