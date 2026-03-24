// 延迟加载的完整应用
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './styles/global.css';

console.log('Loading full application...');

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = ''; // 清空简单测试内容
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </React.StrictMode>
  );
  
  console.log('Full application loaded');
}
