<template>
  <el-dialog
    title="任务进度"
    v-model="props.isVisible"
    width="30%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    @close="closeDialog"
  >
    <!-- 循环展示任务状态及对应图标 -->
    <div v-for="(task, index) in tasks" :key="index" class="task">
      <span>{{ task.name }}</span>
      <el-icon>
        <component :is="getIcon(task.status)" />
      </el-icon>
    </div>
  </el-dialog>
</template>

<script setup>
import { Loading, CircleCheck, Warning } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { io } from 'socket.io-client'
import axios from "axios";

// 定义从父组件接收的props
const props = defineProps({
  isVisible: Boolean,
  selectedPod: Object
})

// 定义emit事件
const emit = defineEmits(['close'])

const socket = ref(null)

// 任务状态列表
const tasks = ref([
  { name: 'JSON格式检查', status: 'waiting' },
  { name: '图结构检查', status: 'waiting' },
  { name: '节点连接检查', status: 'waiting' },
  { name: '循环检查', status: 'waiting' }
])

// 关闭对话框的函数
const closeDialog = () => {
  emit('close')
}

// 根据任务状态返回对应的图标组件
const getIcon = (status) => {
  switch (status) {
    case 'waiting':
      return Loading // 等待状态显示Loading图标
    case 'success':
      return CircleCheck // 成功状态显示CircleCheck图标
    case 'failed':
      return Warning // 失败状态显示Warning图标
    default:
      return Loading
  }
}

// WebSocket连接的设置
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

// 更新任务状态的函数
const updateTaskStatus = (taskName, status) => {
  const task = tasks.value.find(t => t.name === taskName)
  if (task) {
    task.status = status
  }
  checkIfTasksCompleted()
}

// 检查所有任务是否已完成（成功或失败）
const checkIfTasksCompleted = () => {
  const allTasksCompleted = tasks.value.every(task => task.status === 'success' || task.status === 'failed')
  if (allTasksCompleted) {
    closeDialog()
  }
}

// 监听 selectedPod 变化并启动分析
watch(() => props.selectedPod, (newPod) => {
  if (newPod) {
    setupWebSocket()

    // 模拟调用后端 API，传递选择的 pod 和任务
    axios.post('http://localhost:5000/analyze', {
      name: newPod.name,
      namespace: newPod.namespace,
      json_list: JSON.stringify([{ data: '分析用的 JSON 数据' }])
    }).then(response => {
      console.log('Pod analysis started successfully:', response.data)
    }).catch(error => {
      console.error('Error during analysis request:', error)
    })
  }
}, { immediate: true })
</script>

<style scoped>
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
