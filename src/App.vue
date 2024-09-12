<template>
  <el-container class="mian-container">
    <!-- 顶部编辑栏 -->
    <el-header class="header" style="width: 100%">
      <HeadBar @start-analysis="openDialog"
               @save-project="saveFlowAndTreeToFile" @load-project="loadFlowAndTreeFromFile"
      />
    </el-header>

    <el-container>
      <el-aside width="400px">
        <LeftTreeBar
            :treeData="treeData"
            :add-category="addCategory"
            :add-flow="addFlow"
            @flowchart-click="changGraphId"
        ></LeftTreeBar>
      </el-aside>
      <MyFlow :id="selectedGraphId" :tree-data="treeData" ref="childFlow"/>

      <!-- Pod Selection Dialog -->
      <PodDialog
          v-model:DialogVisible="isDialogVisible"
          @confirm-selection="handlePodSelection"
      />
    </el-container>


    <!-- 引入任务进度对话框 -->
    <CheckTask
        :isVisible="isProgressDialogVisible"
        :selectedPod="selectedPod"
        @close="closeProgressDialog"
    />
  </el-container>
</template>

<script setup>
import {v4 as uuidv4} from 'uuid'

import HeadBar from './components/bar/HeadBar.vue'
import LeftTreeBar from "@/components/bar/leftTreeBar.vue";
import MyFlow from './components/MyFlow.vue'
import PodDialog from './components/dialogs/resourceChoose.vue'
import {ref} from 'vue'
import CheckTask from './components/dialogs/CheckInputDialog.vue'
const isProgressDialogVisible = ref(false)


const childFlow = ref(null)
// 默认流程图的树结构数据
const treeData = ref([
  {
    id: uuidv4(), // Use uuid for unique id
    label: 'default', // Default root category
    children: []
  }
])

// 控制 Pod 选择对话框的显示
const isDialogVisible = ref(false)
const selectedPod = ref(null)
const selectedGraphId = ref(1)
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

// 处理选中的 Pod 并开始分析
const handlePodSelection = async (pod) => {
  selectedPod.value = pod
  closeDialog()
  openProgressDialog()
}

// Add a new category at the top level
const addCategory = (category) => {
  treeData.value.push(category)
}

// Add a new flow under a specific category
const addFlow = (categoryId, flowData) => {
  const category = treeData.value.find(node => node.id === categoryId)
  if (category) {
    category.children.push(flowData)
  }
}

const changGraphId = (graphId) => {
  selectedGraphId.value = graphId
}

function getFlowData() {
  const flowDataMap = childFlow.value.exportFlowData();  // Call the export function from MyFlow component
  console.log(flowDataMap);
  console.log("abovew")
  const dataToSave = {
    flowDataMap: Array.from(flowDataMap.entries()),
    treeData: treeData.value,  // Get current treeData
  };

  console.log(dataToSave)
  return dataToSave
}

// Function to save the flowDataMap and treeData to a JSON file
function saveFlowAndTreeToFile() {
  let dataToSave = getFlowData()
  // Convert the combined data to JSON
  const jsonData = JSON.stringify(dataToSave, null, 2);

  // Trigger file download with the JSON data
  const blob = new Blob([jsonData], {type: 'application/json'});
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'flow_and_tree_data.json';  // Name of the file
  link.click();
}


// Function to load the flowDataMap and treeData from a JSON file
function loadFlowAndTreeFromFile(text) {

  console.log(text)
  const loadedData = JSON.parse(text);

  // Load treeData from the file
  treeData.value = loadedData.treeData;

  // Convert array back to Map and load flowDataMap
  const newFlowDataMap = new Map(loadedData.flowDataMap);
  childFlow.value.importFlowData(newFlowDataMap)
}

// 添加新的类别
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
