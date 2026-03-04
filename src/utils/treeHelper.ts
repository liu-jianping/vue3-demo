/** 树结构配置：id、父 id、子节点 字段名 */
export interface TreeHelperConfig {
  id: string;
  children: string;
  pid: string;
}

const DEFAULT_CONFIG: TreeHelperConfig = {
  id: 'id',
  children: 'children',
  pid: 'parentId',
};

function getConfig(config: Partial<TreeHelperConfig>): TreeHelperConfig {
  return { ...DEFAULT_CONFIG, ...config };
}

/**
 * 平铺列表转树（根据 pid 归属）
 */
export function listToTree<T = Record<string, unknown>>(
  list: T[],
  config: Partial<TreeHelperConfig> = {}
): T[] {
  const conf = getConfig(config);
  const nodeMap = new Map<unknown, T & Record<string, unknown>>();
  const result: (T & Record<string, unknown>)[] = [];
  const { id, children, pid } = conf;

  for (const node of list) {
    const n = node as T & Record<string, unknown>;
    n[children] = (n[children] as unknown[]) || [];
    nodeMap.set(n[id], n);
  }
  for (const node of list) {
    const n = node as T & Record<string, unknown>;
    const parent = nodeMap.get(n[pid]);
    (parent ? (parent[children] as T[]) : result).push(n);
  }
  return result as T[];
}

/**
 * 树转平铺列表（深度优先）
 */
export function treeToList<T = Record<string, unknown>>(
  tree: T[],
  config: Partial<TreeHelperConfig> = {}
): T[] {
  const conf = getConfig(config);
  const { children } = conf;
  const result: T[] = [];
  function walk(nodes: T[]) {
    for (const node of nodes) {
      const n = node as Record<string, unknown>;
      result.push(node);
      if (n[children] && Array.isArray(n[children])) {
        walk(n[children] as T[]);
      }
    }
  }
  walk(tree);
  return result;
}
