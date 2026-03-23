export interface OpenClawInstance {
  id: string;
  name: string;
  port: number;
  profileDir: string;
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

export interface Node {
  id: string;
  type: 'bot' | 'user' | 'agent' | 'service';
  name: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface Relation {
  id: string;
  from: string;
  to: string;
  type: string;
  permissions?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  type: string;
  content: any;
  metadata?: Record<string, any>;
  timestamp: string;
}
