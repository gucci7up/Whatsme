import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import AccountDetail from './components/AccountDetail';
import Layout from './components/Layout';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/account/:id" element={<AccountDetail />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
