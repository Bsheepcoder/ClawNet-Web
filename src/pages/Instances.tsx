import React from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';

const Instances: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = React.useState(false);

  const columns = [
    {
      title: '实例名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'running' ? 'success' : 'default'}>
          {status === 'running' ? '运行中' : '已停止'}
        </Tag>
      ),
    },
    {
      title: '微信状态',
      dataIndex: 'wechat',
      key: 'wechat',
      render: (wechat: boolean) => (
        <Tag color={wechat ? 'success' : 'default'}>
          {wechat ? '已登录' : '未登录'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space>
          <Button type="link" size="small">详情</Button>
          <Button type="link" size="small">启动</Button>
          <Button type="link" size="small" danger>删除</Button>
        </Space>
      ),
    },
  ];

  const data = [
    { key: '1', name: 'bot-1', port: 19080, status: 'running', wechat: true },
    { key: '2', name: 'bot-2', port: 19051, status: 'running', wechat: false },
    { key: '3', name: 'bot-3', port: 19022, status: 'stopped', wechat: false },
  ];

  return (
    <div>
      <Card
        title="实例管理"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
              创建实例
            </Button>
          </Space>
        }
      >
        <Table columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="创建新实例"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => setIsModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="实例名称" required>
            <Input placeholder="输入实例名称，如：my-bot-1" />
          </Form.Item>
          <Form.Item label="自动配置">
            <Space direction="vertical">
              <Form.Item noStyle>
                <Select mode="multiple" style={{ width: '100%' }} defaultValue={['weixin', 'gateway', 'clawnet']}>
                  <Select.Option value="weixin">自动安装微信插件</Select.Option>
                  <Select.Option value="gateway">自动启动 Gateway</Select.Option>
                  <Select.Option value="clawnet">自动连接 ClawNet</Select.Option>
                </Select>
              </Form.Item>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Instances;
