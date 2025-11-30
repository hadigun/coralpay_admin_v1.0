import { type Edge, type Node } from "@xyflow/react";
import type { EdgeData, NodeData, RouterPlugin } from "@/types";
import { EDGE_DEFAULT_OPTIONS } from "@/constants/tools";

export function generateEdges(nodes: Node<NodeData>[]): Edge<EdgeData>[] {
  const edges: Edge<EdgeData>[] = [];

  for (const node of nodes) {
    const routers: RouterPlugin[] = [];

    for (const plugin of node.data.prePlugins) {
      if (plugin.type === "router") {
        routers.push(plugin);
      }
    }

    for (const plugin of node.data.postPlugins) {
      if (plugin.type === "router") {
        routers.push(plugin);
      }
    }

    for (const router of routers) {
      for (const route of router.config.routes) {
        if (route.edgeId && route.targetMenuId) {
          edges.push({
            id: route.edgeId,
            source: node.id,
            sourceHandle: route.id,
            target: route.targetMenuId,
            ...EDGE_DEFAULT_OPTIONS,
          });
        }
      }
    }

    if (node.type === "start" && node.data.directRoute) {
      edges.push({
        id: node.data.directRoute.edgeId,
        source: node.id,
        sourceHandle: node.id,
        target: node.data.directRoute.targetMenuId,
        ...EDGE_DEFAULT_OPTIONS,
      });
    }
  }

  return edges;
}
