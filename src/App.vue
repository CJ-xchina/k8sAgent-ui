<template>
  <div class="dnd-flow" @drop="onDrop">
    <Sidebar/>
    <VueFlow :nodes="nodes" :edges="edges" :apply-default="false" fit-view-on-init class="confirm-flow"
             @dragover="onDragOver" @dragleave="onDragLeave">
      <DropzoneBackground
          :style="{
          backgroundColor: isDragOver ? '#e7f3ff' : 'transparent',
          transition: 'background-color 0.2s ease',
        }"
      >
        <p v-if="isDragOver">Drop here</p>
      </DropzoneBackground>
      <MiniMap/>
      <SaveRestoreControls/>
      <Background/>
      <Dialog/>
    </VueFlow>
    <!-- 拖动条 -->
    <div class="divider" @mousedown="startDragging"></div>

    <!-- 右侧的 Sidebar -->
    <RightSidebar :nodes="nodes" :style="{ width: rightSidebarWidth + 'px' }" @start-analysis="startAnalysis" />
  </div>
</template>


<script setup>
import {h, ref} from 'vue'
import RightSidebar from './components/RightSidebar.vue'
import {useVueFlow, VueFlow} from '@vue-flow/core'
import {Background} from '@vue-flow/background'
import DropzoneBackground from './components/DropzoneBackgournd.vue'
import Sidebar from './components/AppSidebar.vue'
import Dialog from './components/DeleteDialog.vue'
import {useDialog} from './js/useDialog'
import useDragAndDrop from './js/useDnD'
import SaveRestoreControls from './components/ControlUpdate.vue'
import {MiniMap} from '@vue-flow/minimap'
const dialog = useDialog()
const {onConnect, addEdges, onNodesChange, onEdgesChange, applyNodeChanges, applyEdgeChanges} = useVueFlow()
const {onDragOver, onDrop, onDragLeave, isDragOver} = useDragAndDrop()



const nodes = ref([
  {id: '1', type: 'input', data: {label: 'Click me and'}, position: {x: 0, y: 0}},
  {id: '2', data: {label: `press 'Backspace' to delete me`}, position: {x: 0, y: 100}},
])
const edges = ref([{id: 'e1-2', source: '1', target: '2'}])
const rightSidebarWidth = ref(300)  // 右侧栏的初始宽度
// 拖动逻辑
let isDragging = false

function startDragging(event) {
  isDragging = true
  console.log("dragging!")
  document.addEventListener('mousemove', resizeSidebar)
  document.addEventListener('mouseup', stopDragging)
}

function resizeSidebar(event) {
  if (isDragging) {
    const newWidth = window.innerWidth - event.clientX
    rightSidebarWidth.value = Math.min(Math.max(newWidth, 200), 1000)
  }
}

function stopDragging() {
  isDragging = false
  document.removeEventListener('mousemove', resizeSidebar)
  document.removeEventListener('mouseup', stopDragging)
}



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

onConnect(addEdges)

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


<style src="./main.css">

</style>
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
}
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
