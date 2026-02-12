import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AccountDetail from './components/AccountDetail';
import { Layout } from 'lucide-react';

function App() {
    return (
        <Router>
            <div className="layout">
                <header className="header glass">
                    <Link to="/" style={{ textDecoration: 'none' }}>
                        <div className="logo">WhatsApp API</div>
                    </Link>
                    <nav className="nav">
                        <Link to="/" className="btn btn-primary" style={{ background: 'transparent', boxShadow: 'none' }}>Dashboard</Link>
                    </nav>
                </header>
                <main>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/account/:id" element={<AccountDetail />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
