import api from './api';

export interface CreateInstanceDTO {
  name: string;
  autoInstallWeixin?: boolean;
  autoStartGateway?: boolean;
  autoConnectClawnet?: boolean;
}

export interface Instance {
  id: string;
  name: string;
  port: number;
  status: 'running' | 'stopped';
  wechat?: {
    accountId?: string;
    userId?: string;
    loggedIn: boolean;
    lastLoginAt?: string;
  };
  gateway?: {
    running: boolean;
    pid?: number;
    port: number;
    lastStartedAt?: string;
  };
  clawnet?: {
    connected: boolean;
    nodeId?: string;
    connectedAt?: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export const instanceAPI = {
  // 获取实例列表
  list: () => api.get<{ success: boolean; data: Instance[] }>('/instances'),

  // 获取单个实例
  get: (name: string) => api.get<{ success: boolean; data: Instance }>(`/instances/${name}`),

  // 创建实例
  create: (data: CreateInstanceDTO) => 
    api.post<{ success: boolean; data?: Instance; message?: string }>('/instances', data),

  // 启动实例
  start: (name: string) => 
    api.post<{ success: boolean; message?: string }>(`/instances/${name}/start`),

  // 停止实例
  stop: (name: string) => 
    api.post<{ success: boolean; message?: string }>(`/instances/${name}/stop`),

  // 连接到 ClawNet
  connect: (name: string) => 
    api.post<{ success: boolean; message?: string }>(`/instances/${name}/connect`),

  // 删除实例
  delete: (name: string) => 
    api.delete<{ success: boolean; message?: string }>(`/instances/${name}`),
};
