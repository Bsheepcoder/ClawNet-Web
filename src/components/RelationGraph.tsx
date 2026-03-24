import React, { useEffect, useRef, useState } from 'react';
import { Spin, Empty, Button, Space, Tag, message } from 'antd';
import { ReloadOutlined, ZoomInOutlined, ZoomOutOutlined, FullscreenOutlined } from '@ant-design/icons';

interface Node {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface Relation {
  id: string;
  from: string;
  to: string;
  type: string;
  permissions: string[];
}

interface RelationGraphProps {
  nodes: Node[];
  relations: Relation[];
  onNodeClick?: (node: Node) => void;
  onEdgeClick?: (relation: Relation) => void;
}

// 节点类型配置
const NODE_TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  gateway: { color: '#faad14', label: 'Gateway' },
  bot: { color: '#722ed1', label: 'Bot' },
  user: { color: '#1890ff', label: 'User' },
  agent: { color: '#52c41a', label: 'Agent' },
  service: { color: '#fa8c16', label: 'Service' },
};

// 关系类型配置
const RELATION_TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  observe: { color: '#1890ff', label: 'Observe' },
  manage: { color: '#fa8c16', label: 'Manage' },
  collaborate: { color: '#52c41a', label: 'Collaborate' },
  delegate: { color: '#722ed1', label: 'Delegate' },
};

const RelationGraph: React.FC<RelationGraphProps> = ({
  nodes,
  relations,
  onNodeClick,
  onEdgeClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [graphInitialized, setGraphInitialized] = useState(false);

  useEffect(() => {
    if (!containerRef.current || nodes.length === 0) {
      return;
    }

    // 动态加载 G6
    const initGraph = async () => {
      setLoading(true);
      try {
        const G6 = (await import('@antv/g6')).default;

        // 准备数据
        const graphData = {
          nodes: nodes.map((node, index) => {
            const config = NODE_TYPE_CONFIG[node.type] || NODE_TYPE_CONFIG.bot;
            const angle = (index * 2 * Math.PI) / nodes.length;
            const radius = 200;
            
            return {
              id: node.id,
              label: node.name,
              x: 400 + radius * Math.cos(angle),
              y: 300 + radius * Math.sin(angle),
              style: {
                fill: node.status === 'online' ? config.color : '#d9d9d9',
                stroke: '#fff',
                lineWidth: 3,
              },
            };
          }),
          edges: relations.map((relation) => {
            const config = RELATION_TYPE_CONFIG[relation.type] || RELATION_TYPE_CONFIG.collaborate;
            return {
              id: relation.id,
              source: relation.from,
              target: relation.to,
              style: {
                stroke: config.color,
                lineWidth: 2,
                endArrow: true,
              },
              label: config.label,
            };
          }),
        };

        // 创建图实例
        const graph = new G6.Graph({
          container: containerRef.current!,
          width: containerRef.current!.scrollWidth,
          height: 500,
          modes: {
            default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
          },
          defaultNode: {
            type: 'circle',
            size: 50,
            style: {
              cursor: 'pointer',
            },
            labelCfg: {
              style: {
                fill: '#fff',
                fontSize: 12,
              },
            },
          },
          defaultEdge: {
            style: {
              cursor: 'pointer',
            },
          },
          layout: {
            type: 'force',
            preventOverlap: true,
            linkDistance: 200,
          },
          animate: true,
          fitView: true,
          fitViewPadding: [20, 40, 20, 40],
        });

        graph.data(graphData);
        graph.render();
        
        setGraphInitialized(true);
      } catch (error) {
        console.error('Failed to initialize graph:', error);
        message.error('Failed to initialize relation graph');
      } finally {
        setLoading(false);
      }
    };

    initGraph();
  }, [nodes, relations]);

  if (nodes.length === 0) {
    return (
      <Empty
        description="No nodes available"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      >
        <p style={{ color: '#8c8c8c' }}>Add nodes to view the relation graph</p>
      </Empty>
    );
  }

  return (
    <div>
      {/* 控制按钮 */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />}>
          Refresh
        </Button>
        <Button icon={<ZoomInOutlined />}>
          Zoom In
        </Button>
        <Button icon={<ZoomOutOutlined />}>
          Zoom Out
        </Button>
        <Button icon={<FullscreenOutlined />}>
          Fit View
        </Button>
      </Space>

      {/* 图例 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ color: '#8c8c8c' }}>Node Types:</span>
        {Object.entries(NODE_TYPE_CONFIG).map(([type, config]) => (
          <Tag key={type} color={config.color}>
            {config.label}
          </Tag>
        ))}
        <span style={{ color: '#8c8c8c', marginLeft: 16 }}>Relation Types:</span>
        {Object.entries(RELATION_TYPE_CONFIG).map(([type, config]) => (
          <Tag key={type} color={config.color}>
            {config.label}
          </Tag>
        ))}
      </div>

      {/* 图谱容器 */}
      <Spin spinning={loading}>
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: 500,
            border: '1px solid #e8e8e8',
            borderRadius: 8,
            background: '#fafafa',
          }}
        />
      </Spin>

      {/* 操作提示 */}
      <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
        Tip: Drag nodes to adjust position, scroll to zoom, click node/edge for details
      </div>
    </div>
  );
};

export default RelationGraph;
