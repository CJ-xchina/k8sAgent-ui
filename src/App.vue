<template>
  <el-container class="mian-container" @drop="onDrop">
    <!-- 顶部编辑栏 -->
    <el-header class="header" style="width: 100%">
      <HeadBar @start-analysis="openDialog"/>
    </el-header>

    <el-container>
      <el-aside width="400px">
        <LeftTreeBar></LeftTreeBar>
      </el-aside>
      <MyFlow/>

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
import HeadBar from './components/bar/HeadBar.vue'
import LeftTreeBar from "@/components/bar/leftTreeBar.vue";
import MyFlow from './components/MyFlow.vue'
import PodDialog from './components/dialogs/resourceChoose.vue'
import useDragAndDrop from './js/useDnD'
import {ref} from 'vue'
import CheckTask from './components/dialogs/CheckInputDialog.vue'

const isProgressDialogVisible = ref(false)
const {onDrop} = useDragAndDrop()

// 控制 Pod 选择对话框的显示
const isDialogVisible = ref(false)
const selectedPod = ref(null)

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
