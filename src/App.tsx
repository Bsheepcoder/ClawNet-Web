import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Instances from './pages/Instances';
import Nodes from './pages/Nodes';
import Relations from './pages/Relations';
import './App.css';

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/instances" element={<Instances />} />
          <Route path="/instances/:id" element={<div>Instance Detail</div>} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/relations" element={<Relations />} />
          <Route path="/permissions" element={<div>Permissions</div>} />
          <Route path="/messages" element={<div>Messages</div>} />
          <Route path="/adapters" element={<div>Adapters</div>} />
          <Route path="/settings" element={<div>Settings</div>} />
        </Routes>
      </AppLayout>
    </Layout>
  );
}

export default App;
