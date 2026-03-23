import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Instances from './pages/Instances';
import InstanceDetail from './pages/InstanceDetail';
import Nodes from './pages/Nodes';
import Relations from './pages/Relations';
import Permissions from './pages/Permissions';
import Messages from './pages/Messages';
import Adapters from './pages/Adapters';
import Settings from './pages/Settings';
import './App.css';

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/instances" element={<Instances />} />
          <Route path="/instances/:id" element={<InstanceDetail />} />
          <Route path="/nodes" element={<Nodes />} />
          <Route path="/relations" element={<Relations />} />
          <Route path="/permissions" element={<Permissions />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/adapters" element={<Adapters />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppLayout>
    </Layout>
  );
}

export default App;
