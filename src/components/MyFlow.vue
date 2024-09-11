<template>
  <el-main class="main" @drop="onDrop">
    <VueFlow
      :nodes="nodes"
      :edges="edges"
      fit-view-on-init
      class="confirm-flow"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @nodeDoubleClick="selectNode"
      :edgeTypes="{ default: CustomEdge }"
      :nodeTypes="{ default: DefaultNode, input: inputNode, output: outputNode }"
      @edge-update="onEdgeUpdate"
      @connect="onConnect"
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
import { ref } from 'vue'
import { useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import DropzoneBackground from './DropzoneBackgournd.vue'
import Dialog from './dialogs/DeleteDialog.vue'
import useDragAndDrop from '../js/useDnD'
import { MiniMap } from '@vue-flow/minimap'
import NodeDetailsDialog from './dialogs/NodeDetailsDialog.vue'
import CustomEdge from './edges/CustomEdge.vue'
import DefaultNode from './nodes/DefaultNode.vue'
import inputNode from './nodes/InputNode.vue'
import outputNode from './nodes/OutputNode.vue'

const { addEdges, updateEdge } = useVueFlow(1)
const { onDragOver, onDrop, onDragLeave, isDragOver } = useDragAndDrop()

const nodes = ref([
  { id: '1', type: 'input', data: { label: 'Click me and' }, position: { x: 0, y: 0 } },
  { id: '2', data: { label: `press 'Backspace' to delete me` }, position: { x: 0, y: 100 } },
])
const edges = ref([{ id: 'e1-2', source: '1', target: '2', updatable: true }])

const selectedNode = ref(null)  // 添加 selectedNode

function onEdgeUpdate({edge, connection}) {
  updateEdge(edge, connection)
}

function onConnect(params) {
  const edge = {
    id: `edge-${Math.random().toString(36).substr(2, 9)}`, // 生成一个随机id
    type: "default",
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle,
    targetHandle: params.targetHandle,
    data: {
      label: ""
    },
    updatable: true // 设置为可更新
  }
  addEdges([edge])
}


// 选中节点逻辑
function selectNode(event) {
  selectedNode.value = event.node  // 选中节点
}

function clearSelectedNode() {
  selectedNode.value = null  // 关闭对话框时清除选中的节点
}

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
