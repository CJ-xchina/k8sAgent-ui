import {useVueFlow} from '@vue-flow/core'

const {getConnectedEdges, removeEdges} = useVueFlow()
export function deleteNodeAndEdges(nodes, edges, nodeId) {
    const node = nodes.value.find(n => n.id === nodeId);

    if (node) {
        // 找到与该节点相关的所有边
        const connectedEdges = getConnectedEdges([node], edges.value);

        removeEdges(connectedEdges)
    }
}
