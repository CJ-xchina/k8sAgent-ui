<template>
  <div class="right-sidebar">
    <!-- 开始分析按钮，点击后触发 startAnalysis 函数 -->
    <el-button type="success" class="start-analysis-btn" @click="startAnalysis">Start Analysis</el-button>

    <!-- 资源类型切换按钮组 -->
    <el-radio-group v-model="resourceType" class="resource-switcher">
      <el-radio-button label="pod">Pod</el-radio-button>
      <el-radio-button label="service">Service</el-radio-button>
      <el-radio-button label="deployment">Deployment</el-radio-button>
    </el-radio-group>

    <!-- Pod 列表 -->
    <div class="resource-list">
      <div
          v-for="pod in podList"
          :key="pod.id"
          :class="['resource-item', pod.status === 'Running' ? 'running' : 'not-running', selectedPodIds.includes(pod.id) ? 'selected' : '']"
          @click="toggleSelectPod(pod.id)"
      >
        <p>{{ pod.name }} ({{ pod.namespace }}) - Status: {{ pod.status }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import axios from 'axios' // 导入axios库
import {getPodDetails} from "@/js/remoteAPI";
import {useVueFlow} from "@vue-flow/core"; // 假设这是你的API调用工具
const {toObject} = useVueFlow()

const emit = defineEmits(['start-analysis']) // 定义事件发射器
const podList = ref([]) // Pod 列表
const selectedPodIds = ref([]) // 选中的 Pod ID 列表
const resourceType = ref('pod') // 资源类型
const selectedPods = ref([]) // 选中的Pod名称和命名空间列表

// 定时器，用于每 10 秒获取 Pod 详情
let interval

// 获取 Pod 详情的 API 调用函数
async function fetchPodDetails() {
  try {
    const response = await getPodDetails(); // 调用远程 API 获取简化的 Pod 数据

    // 将 API 响应结果赋值给 podList
    podList.value = response.map(pod => ({
      name: pod.name,
      namespace: pod.namespace,
      status: pod.status,
      id: pod.id || pod.name // 如果没有 id 则使用 name 作为唯一标识
    }));
  } catch (error) {
    console.error('Error fetching pod details:', error); // 捕获并输出错误
  }
}

// 组件挂载时，首次调用 fetchPodDetails 并设置定时器
onMounted(() => {
  fetchPodDetails() // 初次获取数据
  interval = setInterval(fetchPodDetails, 10000) // 每 10 秒获取一次数据
})

// 切换选中状态的函数
function toggleSelectPod(podId) {
  const index = selectedPodIds.value.indexOf(podId); // 查找 podId 是否在选中列表中
  if (index === -1) {
    selectedPodIds.value.push(podId); // 如果未选中，加入选中列表
  } else {
    selectedPodIds.value.splice(index, 1); // 如果已选中，则取消选中
  }

  // 更新选中的Pod名称和命名空间
  selectedPods.value = podList.value.filter(pod => selectedPodIds.value.includes(pod.id));
}

// 点击“开始分析”按钮时触发的函数
async function startAnalysis() {
  if (selectedPodIds.value.length === 0) {
    alert("请至少选择一个 Pod 进行分析！"); // 如果没有选择 Pod，弹出提示
    return;
  }

  // 准备分析请求的数据
  const podNames = selectedPods.value.map(pod => pod.name);
  const podNamespaces = selectedPods.value.map(pod => pod.namespace);
  const jsonStr = JSON.stringify(toObject()); // 假设你有一个用于分析的json数据，这里可以替换成实际的json内容

  try {
    // 调用后端分析接口
    const response = await axios.post('http://localhost:5000/analyze', {
      names: podNames,
      namespaces: podNamespaces,
      json: jsonStr
    });

    if (response.status === 200) {
      console.log('Pod analysis executed successfully:', response.data);
      alert('Pod analysis executed successfully');
    } else {
      console.error('Analysis failed:', response.data);
    }
  } catch (error) {
    console.error('Error during analysis request:', error);
    alert('Error during analysis request');
  }
}
</script>

<style scoped>
.right-sidebar {
  width: 300px;
  border-left: 1px solid #d3d3d3;
  padding: 20px;
  background: #f9f9f9;
  height: 100vh;
  overflow-y: auto;
}

.start-analysis-btn {
  width: 100%;
  margin-bottom: 20px;
}

.resource-switcher {
  margin-bottom: 20px;
}

.resource-list {
  max-height: 70vh;
  overflow-y: auto;
}

.resource-item {
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d3d3d3;
}

.resource-item.running {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.resource-item.not-running {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.resource-item.selected {
  border: 2px solid #007bff;
}
</style>
