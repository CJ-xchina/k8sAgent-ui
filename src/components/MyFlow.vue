<template>
  <el-main class="main" @drop="onDrop_temp">
    <VueFlow
        :key="props.id" :id="props.id"
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
    <NodeDetailsDialog :node="selectedNode" @close="clearSelectedNode"/>
  </el-main>
</template>

<script setup>
import {ref, watch} from 'vue'
import {useVueFlow, VueFlow} from '@vue-flow/core'
import {Background} from '@vue-flow/background'
import DropzoneBackground from './DropzoneBackgournd.vue'
import Dialog from './dialogs/DeleteDialog.vue'
import useDragAndDrop from '../js/useDnD'
import {MiniMap} from '@vue-flow/minimap'
import NodeDetailsDialog from './dialogs/NodeDetailsDialog.vue'
import CustomEdge from './edges/CustomEdge.vue'
import DefaultNode from './nodes/DefaultNode.vue'
import inputNode from './nodes/InputNode.vue'
import outputNode from './nodes/OutputNode.vue'

const props = defineProps({
  id: {
    type: String,
    required: true
  },
  treeData: {
    type: Array,
    required: true
  }
})

// Map to store flow data (nodes and edges) for each ID
const flowDataMap = new Map()
const {onDragOver, onDragLeave, isDragOver, onDrop} = useDragAndDrop(props.id)

let onDrop_temp = ref(onDrop)
const selectedNode = ref(null)  // 添加 selectedNode

function onEdgeUpdate({edge, connection}) {
  const {updateEdge} = useVueFlow(props.id)

  updateEdge(edge, connection)
}

function onConnect(params) {
  const {addEdges} = useVueFlow(props.id)

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

// Watch for changes in 1 and save/load flow data dynamically
watch(
    () => props.id,
    (newId, oldId) => {

      const dndFunctions = useDragAndDrop(newId);

      onDrop_temp.value = dndFunctions.onDrop


      // Get the Vue Flow instance for the current flow
      const {toObject} = useVueFlow(oldId);


      // Save current flow data to the map using toObject
      const flowData = toObject(); // Get the full flow state
      console.log(flowData);
      flowDataMap.set(oldId, flowData); // Save flow state in the map


      const {fromObject} = useVueFlow(newId)
      // Load the new flow data from the map or set to empty if not present
      let savedFlowData = flowDataMap.get(newId);

      if (savedFlowData === undefined || savedFlowData.nodes === undefined || savedFlowData.edges === undefined) {
        savedFlowData = {
          nodes: [],
          edges: []
        }
      }

      fromObject(savedFlowData)
    },
    {immediate: true} // Trigger immediately on first load
);

// Function to return the flowDataMap (instead of saving to a file)
function exportFlowData() {

  // Iterate over treeData and collect all the flow data for children
  props.treeData.forEach(category => {
    category.children.forEach(flow => {
      const flowId = flow.id;

      if (!flowDataMap.has(flowId)) {
        // Create the VueFlow instance for each flow ID
        const {toObject} = useVueFlow(flowId);

        // Get the flow data for this specific flowchart
        const flowData = toObject();

        // Save this flow data to the map
        flowDataMap.set(flowId, flowData);
      }
    });
  });

  console.log("final :");
  console.log(flowDataMap)
  return flowDataMap;
}

// Function to import a flowDataMap (instead of loading from a file)
function importFlowData(newFlowDataMap) {
  // Replace the current flowDataMap with the new one
  flowDataMap.clear()
  newFlowDataMap.forEach((value, key) => {
    flowDataMap.set(key, value)
  })

  // Load the current flow data for the active ID
  const savedFlowData = flowDataMap.get(props.id)

  if (savedFlowData) {
    const {fromObject} = useVueFlow(props.id)
    fromObject(savedFlowData)
  }
}


// eslint-disable-next-line no-undef
defineExpose({
  exportFlowData,
  importFlowData,
});
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
