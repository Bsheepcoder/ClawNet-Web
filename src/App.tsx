import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';

import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Instances from './pages/Instances';
import InstanceDetail from './pages/InstanceDetail';
import Nodes from './pages/Nodes';
import Relations from './pages/Relations';
import Messages from './pages/Messages';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          colorBgContainer: '#141414',
          colorBgElevated: '#1f1f1f',
          colorBorder: '#434343',
          colorText: 'rgba(255, 255, 255, 0.85)',
          colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="instances" element={<Instances />} />
            <Route path="instances/:id" element={<InstanceDetail />} />
            <Route path="nodes" element={<Nodes />} />
            <Route path="relations" element={<Relations />} />
            <Route path="messages" element={<Messages />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
