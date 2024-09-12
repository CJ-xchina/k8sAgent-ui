<template>
  <el-container class="mian-container" @drop="onDrop">
    <!-- 顶部编辑栏 -->
    <el-header class="header" style="width: 100%">
      <HeadBar @start-analysis="openDialog"/>
    </el-header>

    <!-- 引入 MyFlow 组件 -->
    <MyFlow />

    <!-- Pod Selection Dialog -->
    <PodDialog
      v-model:DialogVisible="isDialogVisible"
      @confirm-selection="handlePodSelection"
    />

    <!-- 任务进度对话框 -->
    <el-dialog
      title="任务进度"
      v-model="isProgressDialogVisible"
      width="30%"
      :before-close="closeProgressDialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <!-- 循环展示任务状态及对应图标 -->
      <div v-for="(task, index) in tasks" :key="index" class="task">
        <span>{{ task.name }}</span>
        <el-icon>
          <!-- 根据任务状态展示相应的图标 -->
          <component :is="getIcon(task.status)" />
        </el-icon>
      </div>
    </el-dialog>
  </el-container>
</template>

<script setup>
import HeadBar from './components/HeadBar.vue'
import MyFlow from './components/MyFlow.vue'
import PodDialog from './components/dialogs/resourceChoose.vue'
import useDragAndDrop from './js/useDnD'
import {ref} from 'vue'
import axios from 'axios'
import {io} from 'socket.io-client'
import {Loading, CircleCheck, Warning} from '@element-plus/icons-vue'

const isProgressDialogVisible = ref(false)
const {onDrop} = useDragAndDrop()

// 控制 Pod 选择对话框的显示
const isDialogVisible = ref(false)
const isAnalyzing = ref(false)
const selectedPod = ref(null)
const socket = ref(null)

const tasks = ref([
  {name: 'JSON格式检查', status: 'waiting'},
  {name: '图结构检查', status: 'waiting'},
  {name: '节点连接检查', status: 'waiting'},
  {name: '循环检查', status: 'waiting'}
])

// 打开 Pod 选择对话框
const openDialog = () => {
  isDialogVisible.value = true
}

// 关闭 Pod 选择对话框
const closeDialog = () => {
  isDialogVisible.value = false
}

// 打开任务进度对话框
const openProgressDialog = () => {
  isProgressDialogVisible.value = true
}

// 关闭任务进度对话框
const closeProgressDialog = () => {
  isProgressDialogVisible.value = false
}

// 根据任务状态返回对应的图标组件
const getIcon = (status) => {
  switch (status) {
    case 'waiting':
      return Loading  // 等待状态显示Loading图标
    case 'success':
      return CircleCheck  // 成功状态显示CircleCheck图标
    case 'failed':
      return Warning  // 失败状态显示Warning图标
    default:
      return Loading
  }
}

// 检查所有任务是否已完成（成功或失败）
const checkIfTasksCompleted = () => {
  const allTasksCompleted = tasks.value.every(task => task.status === 'success' || task.status === 'failed')
  if (allTasksCompleted) {
    closeProgressDialog()
  }
}

// 更新任务状态的函数，基于 WebSocket 数据更新
const updateTaskStatus = (taskName, status) => {
  const task = tasks.value.find(t => t.name === taskName)
  if (task) {
    task.status = status
  }
  checkIfTasksCompleted()
}

// 处理选中的 Pod 并开始分析
const handlePodSelection = async (pod) => {
  selectedPod.value = pod
  closeDialog()
  await startAnalysis()
}

// 开始分析的函数，调用后端接口
const startAnalysis = async () => {
  if (selectedPod.value === null) {
    alert('请至少选择一个 Pod 进行分析！')
    return
  }
  const podName = selectedPod.value.name
  const podNamespace = selectedPod.value.namespace
  const jsonStr = JSON.stringify([{data: '分析用的 JSON 数据'}])

  isAnalyzing.value = true
  setupWebSocket()
  openProgressDialog()

  try {
    const response = await axios.post('http://localhost:5000/analyze', {
      name: podName,
      namespace: podNamespace,
      json_list: jsonStr
    })

    if (response.status === 200) {
      console.log('Pod analysis started successfully:', response.data)
    } else {
      console.error('Analysis failed:', response.data)
    }
  } catch (error) {
    console.error('Error during analysis request:', error)
    alert('Error during analysis request')
  }

  isAnalyzing.value = false
}

// 初始化 WebSocket 连接
const setupWebSocket = () => {
  socket.value = io('http://localhost:5000')

  // 监听后端推送的任务状态更新事件
  socket.value.on('check_update', (data) => {
    console.log('Received check update:', data)
    updateTaskStatus(data.task, data.result ? 'success' : 'failed')
  })

  socket.value.on('disconnect', () => {
    console.log('WebSocket disconnected')
  })
}
</script>

<style src="./main.css"></style>

<style scoped>
.mian-container {
  height: 100%;
  width: 100%;
}

.mian-container > .header {
  height: 10%;
  margin: 0;
  padding: 0;
}

.task {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
}

.el-icon {
  font-size: 24px;
}
</style>
