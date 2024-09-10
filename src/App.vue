<template>
  <div class="dnd-flow" @drop="onDrop">
    <!-- 左侧 Sidebar -->
    <Sidebar v-if="isLeftSidebarVisible" :style="{ width: leftSidebarWidth + 'px' }"/>

    <!-- 左侧拖动条带按钮 -->
    <div class="divider">
      <button @mousedown="startDraggingLeft" @click="toggleLeftSidebar">{{
          isLeftSidebarVisible ? '<<' : '>>'
        }}
      </button>
    </div>

    <VueFlow :nodes="nodes" :edges="edges" :apply-default="false" fit-view-on-init class="confirm-flow"
             @dragover="onDragOver" @dragleave="onDragLeave" @nodeDoubleClick="selectNode"
             :edgeTypes="{ default: CustomEdge }"
             :nodeTypes="{default: DefaultNode, input: inputNode, output: outputNode}"
             @edge-update="onEdgeUpdate"
             @connect="onConnect"
             @edge-update-start="onEdgeUpdateStart"
             @edge-update-end="onEdgeUpdateEnd">
      <DropzoneBackground
          :style="{
          backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
          transition: 'background-color 0.2s ease',
        }"
      >
        <p v-if="isDragOver">拖拽完成节点添加</p>


      </DropzoneBackground>
      <MiniMap/>
      <SaveRestoreControls/>
      <Background/>
      <Dialog/>
    </VueFlow>

    <!-- 当选中节点时显示 NodeDetailsDialog -->
    <NodeDetailsDialog :node="selectedNode" @close="clearSelectedNode"/>

    <!-- 右侧拖动条带按钮 -->
    <div class="divider">
      <button @mousedown="startDraggingRight" @click="toggleRightSidebar">{{
          isRightSidebarVisible ? '>>' : '<<'
        }}
      </button>
    </div>

    <!-- 右侧的 Sidebar -->
    <RightSidebar v-if="isRightSidebarVisible" :nodes="nodes" :style="{ width: rightSidebarWidth + 'px' }"
                  @start-analysis="startAnalysis"/>
  </div>
</template>

<script setup>
import {h, ref} from 'vue'
import RightSidebar from './components/RightSidebar.vue'
import {useVueFlow, VueFlow} from '@vue-flow/core'
import {Background} from '@vue-flow/background'
import DropzoneBackground from './components/DropzoneBackgournd.vue'
import Sidebar from './components/AppSidebar.vue'
import Dialog from './components/dialogs/DeleteDialog.vue'
import {useDialog} from './js/useDialog'
import useDragAndDrop from './js/useDnD'
import SaveRestoreControls from './components/ControlUpdate.vue'
import {MiniMap} from '@vue-flow/minimap'
import NodeDetailsDialog from "@/components/dialogs/NodeDetailsDialog.vue";
import CustomEdge from "@/components/edges/CustomEdge.vue";
import DefaultNode from "@/components/nodes/DefaultNode.vue";
import inputNode from "@/components/nodes/InputNode.vue";
import outputNode from "@/components/nodes/OutputNode.vue";

const dialog = useDialog()
const {addEdges, onNodesChange, onEdgesChange, applyNodeChanges, applyEdgeChanges, updateEdge} = useVueFlow()
const {onDragOver, onDrop, onDragLeave, isDragOver} = useDragAndDrop()

const nodes = ref([
  {id: '1', type: 'input', data: {label: 'Click me and'}, position: {x: 0, y: 0}},
  {id: '2', data: {label: `press 'Backspace' to delete me`}, position: {x: 0, y: 100}},
])
const edges = ref([{id: 'e1-2', source: '1', target: '2', updatable: true}])
const rightSidebarWidth = ref(300)  // 右侧栏的初始宽度
const leftSidebarWidth = ref(300)   // 左侧栏的初始宽度


let isDragging = false

const selectedNode = ref(null)  // 添加 selectedNode

// 控制左侧和右侧 Sidebar 显示状态
const isLeftSidebarVisible = ref(true)
const isRightSidebarVisible = ref(true)


function onEdgeUpdateStart(edge) {
  console.log('start update', edge)
}

function onEdgeUpdateEnd(edge) {
  console.log('end update', edge)
}

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


// 切换左侧 Sidebar 显示
function toggleLeftSidebar() {
  isLeftSidebarVisible.value = !isLeftSidebarVisible.value
}

// 切换右侧 Sidebar 显示
function toggleRightSidebar() {
  isRightSidebarVisible.value = !isRightSidebarVisible.value
}

// 左侧拖动逻辑
function startDraggingLeft() {
  isDragging = true
  document.addEventListener('mousemove', resizeLeftSidebar)
  document.addEventListener('mouseup', stopDragging)
}

// 右侧拖动逻辑
function startDraggingRight() {
  isDragging = true
  document.addEventListener('mousemove', resizeRightSidebar)
  document.addEventListener('mouseup', stopDragging)
}

function resizeLeftSidebar(event) {
  if (isDragging) {
    leftSidebarWidth.value = Math.min(Math.max(event.clientX, 100), 600) // 控制宽度范围
  }
}

function resizeRightSidebar(event) {
  if (isDragging) {
    const newWidth = window.innerWidth - event.clientX
    rightSidebarWidth.value = Math.min(Math.max(newWidth, 200), 1000)
  }
}

function stopDragging() {
  isDragging = false
  document.removeEventListener('mousemove', resizeLeftSidebar)
  document.removeEventListener('mousemove', resizeRightSidebar)
  document.removeEventListener('mouseup', stopDragging)
}

// 拖动逻辑代码


function dialogMsg(id) {
  return h(
      'span',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        },
      },
      [`Are you sure?`, h('br'), h('span', `[ELEMENT_ID: ${id}]`)],
  )
}

function startAnalysis() {
  alert('Analysis Started!')
}
onNodesChange(async (changes) => {
  const nextChanges = []

  for (const change of changes) {
    if (change.type === 'remove') {
      const isConfirmed = await dialog.confirm(dialogMsg(change.id))

      if (isConfirmed) {
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
      const isConfirmed = await dialog.confirm(dialogMsg(change.id))

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

<style src="./main.css"></style>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.divider {
  width: 10px;
  background: #2c3e50;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 96%;
}

button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

button:hover {
  color: #1abc9c;
}
</style>
