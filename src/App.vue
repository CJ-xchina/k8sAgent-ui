<template>
  <el-container class="mian-container" @drop="onDrop">
    <!-- 顶部编辑栏 -->
    <el-header class="header" style="width: 100%">
      <HeadBar />
    </el-header>

    <!-- 引入 MyFlow 组件 -->
    <MyFlow />
  </el-container>
</template>

<script setup>
import HeadBar from './components/HeadBar.vue'
import MyFlow from './components/MyFlow.vue'
import useDragAndDrop from './js/useDnD'

const { onDrop } = useDragAndDrop()
</script>

<style src="./main.css"></style>

<style>
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
