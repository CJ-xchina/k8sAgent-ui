<template>
  <el-main class="main" @drop="onDrop_temp" @dragover="onDragOver">
    <VueFlow
        :key="props.id" :id="props.id"
      fit-view-on-init
        class="confirm-flow, basic-flow"
      @dragleave="onDragLeave"
        @node-drag="onNodeDrag"
        @node-drag-stop="onNodeDragStop"
      @nodeDoubleClick="selectNode"
      :edgeTypes="{ default: CustomEdge }"
      :nodeTypes="{ default: DefaultNode, input: inputNode, output: outputNode, group: GroupNode }"
      @edge-update="onEdgeUpdate"
      @connect="onConnect"
      :class="{ dark }"
      :default-viewport="{ zoom: 1.5 }"
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

      <Controls position="top-center">
        <ControlButton title="Reset Transform" @click="resetTransform">
          <Icon name="reset"/>
        </ControlButton>

        <ControlButton title="Shuffle Node Positions" @click="updatePos">
          <Icon name="update"/>
        </ControlButton>

        <ControlButton title="Toggle Dark Mode" @click="toggleDarkMode">
          <Icon v-if="dark" name="sun"/>
          <Icon v-else name="moon"/>
        </ControlButton>

        <ControlButton title="Log `toObject`" @click="logToObject">
          <Icon name="log"/>
        </ControlButton>
      </Controls>

      <Background />
      <Dialog />
    </VueFlow>
    <!-- 当选中节点时显示 NodeDetailsDialog -->
    <NodeDetailsDialog :node="selectedNode" :id="props.id" @close="clearSelectedNode"/>
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
import {ControlButton, Controls} from '@vue-flow/controls'
import Icon from "@/components/Icon.vue";
import GroupNode from "@/components/nodes/GroupNode.vue";

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
let dropParentNode = ref(null);

function onEdgeUpdate({edge, connection}) {
  const {updateEdge,} = useVueFlow(props.id)

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

function onNodeDrag(event) {
  // 获取 VueFlow 实例的方法
  const {
    getIntersectingNodes,
    updateNode,
    nodes
  } = useVueFlow(props.id);

  // 获取当前拖动的节点
  const draggedNode = event.node;

  // 仅处理 "default" 类型节点
  if (draggedNode.type !== "default") return;


  // 获取与当前拖动节点相交的所有节点
  const intersections = getIntersectingNodes(draggedNode);
  const intersectionIds = intersections.map(node => node.id);


  dropParentNode = null; // 清空上次的相交父节点

  // 遍历所有 "group" 类型节点，移除 "intersecting" 类
  nodes.value.forEach(node => {
    if (node.type === "group") {
      updateNode(node.id, {class: ''});
    }
  });
  // 查找第一个与拖动节点相交的 "group" 节点
  for (const node of nodes.value) {
    if (node.type === "group" && intersectionIds.includes(node.id)) {
      updateNode(node.id, {class: 'intersecting'}); // 为相交的 group 节点添加 "intersecting" 类
      dropParentNode = node; // 保存相交的 group 节点
      break; // 只处理第一个相交节点
    }
  }

}

function isValidGroupPair(node, groupNode) {
  // 验证拖动节点与组节点的匹配有效性
  return node.type === "default" && node.parentNode !== node.id && groupNode.type === "group";
}

// 监听拖拽结束事件
function onNodeDragStop(event) {
  const draggedNode = event.node;

  console.log(draggedNode);
  console.log(dropParentNode);

  // 如果没有相交节点且拖动节点有父节点，则重置其父节点
  if (!dropParentNode) {
    if (draggedNode.parentNode) {
      draggedNode.parentNode = ""; // 重置为没有父节点
    }
    return;
  }

  // 清空相交节点的 "intersecting" 类
  dropParentNode.class = '';

  // 如果节点与组匹配有效，则将拖动节点的父节点设置为相交组节点
  if (isValidGroupPair(draggedNode, dropParentNode)) {
    draggedNode.parentNode = dropParentNode.id;
  }

  console.log(draggedNode);
  console.log(dropParentNode);
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

  // Check and remove keys that are not valid UUIDs
  flowDataMap.forEach((value, key) => {
    if (!isValidUUID(key)) {
      flowDataMap.delete(key);
    }
  });
  return flowDataMap;
}

// Utility function to validate if a string is a valid UUID (version 4)
function isValidUUID(uuid) {
  if (uuid === undefined) {
    return false
  }
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
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


// our dark mode toggle flag
const dark = ref(false)


function toggleDarkMode() {
  dark.value = !dark.value
}

// eslint-disable-next-line no-undef
defineExpose({
  exportFlowData,
  importFlowData,
});
</script>

<style>
.vue-flow__node.intersecting {
  background-color: #f15a16
}
</style>
