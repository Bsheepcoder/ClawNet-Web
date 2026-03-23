import api from './api';

export interface Node {
  id: string;
  type: 'bot' | 'user' | 'agent' | 'service';
  name: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateNodeDTO {
  id: string;
  type: Node['type'];
  name: string;
  metadata?: Record<string, any>;
}

export const nodeAPI = {
  // 获取节点列表
  list: () => api.get<{ success: boolean; data: Node[] }>('/nodes'),

  // 获取单个节点
  get: (id: string) => api.get<{ success: boolean; data: Node }>(`/nodes/${id}`),

  // 创建节点
  create: (data: CreateNodeDTO) => 
    api.post<{ success: boolean; data: Node }>('/nodes', data),

  // 更新节点
  update: (id: string, data: Partial<Node>) => 
    api.put<{ success: boolean; data: Node }>(`/nodes/${id}`, data),

  // 删除节点
  delete: (id: string) => 
    api.delete<{ success: boolean }>(`/nodes/${id}`),
};
