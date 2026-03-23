import React from 'react';
import { Card, Form, Input, Switch, Button, Divider, message, Alert } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const Settings: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log('Settings saved:', values);
    message.success('设置已保存');
  };

  return (
    <div>
      <Alert
        message="系统设置"
        description="配置 ClawNet Web 的全局设置和参数"
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card title="⚙️ 基础配置">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            apiUrl: 'http://localhost:3000',
            wsUrl: 'ws://localhost:3000',
            theme: 'light',
            language: 'zh-CN',
          }}
        >
          <Form.Item label="API 地址" name="apiUrl">
            <Input placeholder="http://localhost:3000" />
          </Form.Item>

          <Form.Item label="WebSocket 地址" name="wsUrl">
            <Input placeholder="ws://localhost:3000" />
          </Form.Item>

          <Form.Item label="主题" name="theme">
            <Switch
              checkedChildren="暗色"
              unCheckedChildren="亮色"
              defaultChecked={false}
            />
          </Form.Item>

          <Form.Item label="语言" name="language">
            <Input placeholder="zh-CN" disabled />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <Card title="🔐 认证配置">
        <Form layout="vertical">
          <Form.Item label="认证 Token">
            <Input.Password placeholder="输入认证 Token" />
          </Form.Item>

          <Form.Item label="自动登录">
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />}>
              保存认证配置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <Card title="📊 监控配置">
        <Form layout="vertical">
          <Form.Item label="启用性能监控">
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item label="启用日志记录">
            <Switch defaultChecked />
          </Form.Item>

          <Form.Item label="日志保留天数">
            <Input type="number" defaultValue={30} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" icon={<SaveOutlined />}>
              保存监控配置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Divider />

      <Card title="📦 系统信息">
        <div>
          <p><strong>版本：</strong>v0.1.0</p>
          <p><strong>构建时间：</strong>{new Date().toLocaleString('zh-CN')}</p>
          <p><strong>Git 分支：</strong>main</p>
          <p><strong>运行环境：</strong>Development</p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
