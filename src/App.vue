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
  </el-container>
</template>

<script setup>
import HeadBar from './components/HeadBar.vue'
import MyFlow from './components/MyFlow.vue'
import PodDialog from './components/dialogs/resourceChoose.vue'
import useDragAndDrop from './js/useDnD'
import {ref} from 'vue'
import axios from 'axios'


const { onDrop } = useDragAndDrop()

// State variables
const isDialogVisible = ref(false)
const isAnalyzing = ref(false)
const selectedPods = ref([])

// 打开 Pod 选择对话框
const openDialog = () => {
  console.log("Attempting to open dialog...");
  isDialogVisible.value = true;
  console.log("Dialog visibility should now be true:", isDialogVisible.value);
}

// 关闭 Pod 选择对话框
const closeDialog = () => {
  isDialogVisible.value = false
}


// 处理选中的 Pod 并开始分析
const handlePodSelection = async (pod) => {
  selectedPods.value = [pod]
  closeDialog()
  await startAnalysis()
}

// 开始分析的函数，调用后端接口
const startAnalysis = async () => {
  if (selectedPods.value.length === 0) {
    alert("请至少选择一个 Pod 进行分析！")
    return
  }

  console.log(selectedPods)
  const podNames = selectedPods.value.map((pod) => pod.name)
  const podNamespaces = selectedPods.value.map((pod) => pod.namespace)
  const jsonStr = JSON.stringify({data: "分析用的 JSON 数据"}) // 示例的 JSON 数据

  isAnalyzing.value = true

  try {
    const response = await axios.post('http://localhost:5000/analyze', {
      names: podNames,
      namespaces: podNamespaces,
      json: jsonStr
    })

    if (response.status === 200) {
      console.log('Pod analysis executed successfully:', response.data)
      alert('Pod analysis executed successfully')
    } else {
      console.error('Analysis failed:', response.data)
    }
  } catch (error) {
    console.error('Error during analysis request:', error)
    alert('Error during analysis request')
  }

  isAnalyzing.value = false
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
</style>
