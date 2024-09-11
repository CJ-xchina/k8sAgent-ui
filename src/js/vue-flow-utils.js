import {getConnectedEdges, useVueFlow} from '@vue-flow/core'

const {removeEdges} = useVueFlow(1)
export function deleteNodeAndEdges(nodes, edges, nodeId) {
    const node = nodes.value.find(n => n.id === nodeId);

    if (node) {
        // 找到与该节点相关的所有边
        const connectedEdges = getConnectedEdges(nodeId, edges.value);
        removeEdges(connectedEdges)
    }
}
