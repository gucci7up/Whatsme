import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Plus, Smartphone, ExternalLink, Activity } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

export default function Dashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');

    const fetchAccounts = async () => {
        try {
            const res = await axios.get(`${API_URL}/accounts`);
            setAccounts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/accounts/create`, {
                client_name: newName,
                phone_number: newPhone
            });
            setNewName('');
            setNewPhone('');
            setIsCreating(false);
            fetchAccounts();
        } catch (err) {
            console.error(err);
            alert('Failed to create account');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>Accounts</h2>
                <button className="btn btn-primary" onClick={() => setIsCreating(true)}>
                    <Plus size={18} /> New Account
                </button>
            </div>

            {isCreating && (
                <div className="card glass">
                    <h3>Create New Account</h3>
                    <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <input
                            className="input"
                            placeholder="Client Name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            required
                        />
                        <input
                            className="input"
                            placeholder="Phone Number (Optional)"
                            value={newPhone}
                            onChange={e => setNewPhone(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary">Create</button>
                        <button type="button" className="btn" onClick={() => setIsCreating(false)}>Cancel</button>
                    </form>
                </div>
            )}

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {accounts.map(acc => (
                        <div key={acc.id} className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>{acc.client_name}</h3>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                        {acc.phone_number || 'No number'}
                                    </div>
                                </div>
                                <div className={`badge ${acc.status === 'connected' ? 'badge-connected' : 'badge-disconnected'}`}>
                                    {acc.status}
                                </div>
                            </div>

                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                <Link to={`/account/${acc.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                                    <Activity size={18} /> Manage
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
