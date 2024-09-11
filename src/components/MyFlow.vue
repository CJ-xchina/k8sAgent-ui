<template>
  <el-main class="main">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      :apply-default="false"
      fit-view-on-init
      class="confirm-flow"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @nodeDoubleClick="selectNode"
      :edgeTypes="{ default: CustomEdge }"
      :nodeTypes="{ default: DefaultNode, input: inputNode, output: outputNode }"
      @edge-update="onEdgeUpdate"
      @connect="onConnect"
      @edge-update-start="onEdgeUpdateStart"
      @edge-update-end="onEdgeUpdateEnd"
    >
      <DropzoneBackground
        :style="{
          backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
          transition: 'background-color 0.2s ease',
        }"
      >
        <p v-if="isDragOver">拖拽完成节点添加</p>
      </DropzoneBackground>

      <MiniMap />
      <Background />
      <Dialog />
    </VueFlow>
    <!-- 当选中节点时显示 NodeDetailsDialog -->
    <NodeDetailsDialog :node="selectedNode" @close="clearSelectedNode" />
  </el-main>
</template>

<script setup>
import { h, ref } from 'vue'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import DropzoneBackground from './DropzoneBackgournd.vue'
import Dialog from './dialogs/DeleteDialog.vue'
import { useDialog } from '@/js/useDialog'
import useDragAndDrop from '../js/useDnD'
import { MiniMap } from '@vue-flow/minimap'
import NodeDetailsDialog from './dialogs/NodeDetailsDialog.vue'
import CustomEdge from './edges/CustomEdge.vue'
import DefaultNode from './nodes/DefaultNode.vue'
import inputNode from './nodes/InputNode.vue'
import outputNode from './nodes/OutputNode.vue'
import { deleteNodeAndEdges } from '../js/vue-flow-utils'

const dialog = useDialog()
const { addEdges, onNodesChange, onEdgesChange, applyNodeChanges, applyEdgeChanges, updateEdge } = useVueFlow()
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop()

const nodes = ref([
  { id: '1', type: 'input', data: { label: 'Click me and' }, position: { x: 0, y: 0 } },
  { id: '2', data: { label: `press 'Backspace' to delete me` }, position: { x: 0, y: 100 } },
])
const edges = ref([{ id: 'e1-2', source: '1', target: '2', updatable: true }])
const selectedNode = ref(null)

// 选中节点逻辑
function selectNode(event) {
  selectedNode.value = event.node
}

function clearSelectedNode() {
  selectedNode.value = null
}

// 连接边的逻辑
function onConnect(params) {
  const edge = {
    id: `edge-${Math.random().toString(36).substr(2, 9)}`,
    type: 'default',
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    data: { label: '' },
    updatable: true,
  }
  addEdges([edge])
}

function onEdgeUpdateStart(edge) {
  console.log('start update', edge)
}

function onEdgeUpdateEnd(edge) {
  console.log('end update', edge)
}

function onEdgeUpdate({ edge, connection }) {
  updateEdge(edge, connection)
}

onNodesChange(async (changes) => {
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'remove') {
      const isConfirmed = await dialog.confirm(`Are you sure to remove node ${change.id}?`)

      if (isConfirmed) {
        deleteNodeAndEdges(nodes, edges, change.id)
        nextChanges.push(change)
      }
    } else {
      nextChanges.push(change)
    }
  }

  applyNodeChanges(nextChanges)
})

onEdgesChange(async (changes) => {
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'remove') {
      const isConfirmed = await dialog.confirm(`Are you sure to remove edge ${change.id}?`)

      if (isConfirmed) {
        nextChanges.push(change)
      }
    } else {
      nextChanges.push(change)
    }
  }

  applyEdgeChanges(nextChanges)
})
</script>

<style scoped>
.main {
  margin: 0;
  padding: 0;
}
.vue-flow {
  height: 100%;
}
</style>
