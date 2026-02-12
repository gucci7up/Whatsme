import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { Send, RefreshCw, Power } from 'lucide-react';

const API_URL = '/api';

export default function AccountDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [account, setAccount] = useState(null);
    const [logs, setLogs] = useState([]);
    const [qrCode, setQrCode] = useState(null);
    const [msgText, setMsgText] = useState('');
    const [msgTo, setMsgTo] = useState('');
    const [loadingQr, setLoadingQr] = useState(false);

    // Polling for QR or Status
    useEffect(() => {
        fetchAccount();
        const interval = setInterval(fetchQr, 3000); // Poll every 3s
        fetchLogs();

        return () => clearInterval(interval);
    }, [id]);

    const fetchAccount = async () => {
        // We don't have a single account endpoint in the initial plan, using list filter or I should add one.
        // For now, I'll filter from list or add endpoint. 
        // Optimization: Just use list for now to save time, or assume I can get it.
        // I didn't verify a "Get Single Account" endpoint in PHP. I implemented `getAll`.
        // I'll add `getOne` logic or just fetch all and find. 
        // Fetching all is fine for MVP.
        const res = await axios.get(`${API_URL}/accounts`);
        const acc = res.data.find(a => a.id == id);
        if (acc) setAccount(acc);
    };

    const fetchQr = async () => {
        try {
            const res = await axios.get(`${API_URL}/accounts/${id}/qr`);
            if (res.data.status === 'connected') {
                setQrCode(null);
                // Optionally update account status locally
            } else if (res.data.qr) {
                setQrCode(res.data.qr);
            }
        } catch (err) {
            // console.error(err);
        }
    };

    const fetchLogs = async () => {
        // Need token for logs? The PHP Logs controller checks for token or returns all if none (dev mode).
        // Ideally we filter by account.
        // I'll implement filtering in frontend for now as the API returns all in dev mode.
        try {
            const res = await axios.get(`${API_URL}/logs`);
            // Filter logs by account_id which should be in the log response
            const filtered = res.data.filter(l => l.account_id == id);
            setLogs(filtered);
        } catch (err) {
            console.error(err);
        }
    };

    const handleConnect = async () => {
        setLoadingQr(true);
        try {
            await axios.post(`${API_URL}/accounts/${id}/connect`);
            // QR should appear in polling
        } catch (err) {
            alert('Error connecting');
        } finally {
            setLoadingQr(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Are you sure?')) return;
        try {
            await axios.post(`${API_URL}/accounts/${id}/disconnect`);
            alert('Disconnected');
            fetchAccount();
        } catch (err) {
            alert('Error disconnecting');
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        // Need API Token for sending? 
        // The PHP endpoint expects Bearer Token. I need to get the account's token.
        // But the Dashboard is "Admin", so it should probably have a way to send as that account.
        // Wait, the PHP code uses `Authorization: Bearer <token>` to identify the account.
        // So I need the account's `api_token`.
        // The `fetchAccount` should return the token.
        // BUT `getAll` in PHP only returns `id, client_name, phone_number, status, created_at`. It DOES NOT return `api_token` for security?
        // Or maybe it does? Let's check `AccountController.php`.
        // `SELECT id, client_name, phone_number, status, created_at FROM whatsapp_accounts` -> NO TOKEN.
        // User needs to generate/see token.
        // I should add a "Reveal Token" or just return it for the dashboard.
        // For this MVP, I will assume the dashboard needs the token to function, so I will modify `AccountController` to return it OR add a specific endpoint to retrieve it.
        // I will assume for now I cannot send from dashboard without updating backend.
        // Let's UPDATE Backend to return token in `getAll` or `getOne`.
        // I'll update `AccountController.php` via `replace_file_content` in a moment.

        if (!account?.api_token) {
            alert('Token not available. Cannot send message from dashboard.');
            return;
        }

        try {
            await axios.post(`${API_URL}/send-message`, {
                to: msgTo,
                message: msgText
            }, {
                headers: { Authorization: `Bearer ${account.api_token}` }
            });
            alert('Message Sent!');
            setMsgText('');
            fetchLogs();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send');
        }
    };

    if (!account) return <div className="layout">Loading...</div>;

    return (
        <div className="layout">
            <div className="header" style={{ border: 'none', padding: 0, marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem' }}>{account.client_name}</h1>
                    <p className="text-secondary">ID: {account.id} • {account.phone_number}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-danger" onClick={handleDisconnect}>
                        <Power size={18} /> Disconnect
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Left Column: Connection & Token */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card glass">
                        <h3>Connection Status</h3>
                        <div className={`badge ${account.status === 'connected' ? 'badge-connected' : 'badge-disconnected'}`}
                            style={{ display: 'inline-block', marginBottom: '1rem' }}>
                            {account.status}
                        </div>

                        {account.status !== 'connected' && (
                            <div>
                                {!qrCode && (
                                    <button className="btn btn-primary" onClick={handleConnect} disabled={loadingQr}>
                                        {loadingQr ? 'Starting...' : 'Pair Device'}
                                    </button>
                                )}
                                {qrCode && (
                                    <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', width: 'fit-content' }}>
                                        <img src={qrCode} alt="Scan QR" style={{ width: '200px', height: '200px' }} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="card glass">
                        <h3>API Token</h3>
                        <div style={{ background: 'var(--bg-primary)', padding: '0.5rem', borderRadius: '4px', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                            {account.api_token || 'Token hidden'}
                        </div>
                    </div>
                </div>

                {/* Right Column: Messenger & Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="card glass">
                        <h3>Send Message</h3>
                        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="input" placeholder="Recipient (e.g. 1234567890)" value={msgTo} onChange={e => setMsgTo(e.target.value)} required />
                            <textarea className="input" placeholder="Message content..." rows={3} value={msgText} onChange={e => setMsgText(e.target.value)} required />
                            <button className="btn btn-primary" type="submit">
                                <Send size={18} /> Send Message
                            </button>
                        </form>
                    </div>

                    <div className="card glass">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h3>Recent Logs</h3>
                            <button className="btn" style={{ padding: '0.25rem' }} onClick={fetchLogs}><RefreshCw size={14} /></button>
                        </div>
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>To</th>
                                        <th>Status</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map(log => (
                                        <tr key={log.id}>
                                            <td>{log.recipient}</td>
                                            <td>{log.status}</td>
                                            <td>{new Date(log.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No logs found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
