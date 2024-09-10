<template>
  <div class="left-sidebar-container">
    <aside class="sidebar">
    <div class="description">You can drag these nodes to the pane.</div>
    <div class="nodes">
      <div class="vue-flow__node-input" :draggable="true" @dragstart="onDragStart($event, 'input')">开始节点</div>

      <div class="vue-flow__node-default" :draggable="true" @dragstart="onDragStart($event, 'default')">中间节点</div>

      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">结束节点</div>
    </div>
  </aside>
  </div>

</template>

<script lang="js" setup>
import useDragAndDrop from '../js/useDnD'

const { onDragStart } = useDragAndDrop()
</script>

<style scoped>
/* 主容器使用 flex 布局 */
.dnd-flow {
  display: flex;
}

/* 设置 aside 元素在左侧，宽度固定 */
.sidebar {
  width: 90%;
  height: 96.9%;
  border-right: 1px solid #ccc;
}

/* 样式更新 */
.description {
  font-size: 14px;
  margin-bottom: 10px;
}

.nodes div {
  margin: 10px 0;
  padding: 8px;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  cursor: grab;
}

.left-sidebar-container {
  height: 100%;
  width: 10%;
  margin: 0;
}
</style>
