<template>
  <div class="head-bar-container">
    <!-- 节点创建工具栏 -->
    <div class="nodes-tool-kit">
      <div class="vue-flow__node-input" :draggable="true" @dragstart="onDragStart($event, 'input')">开始节点</div>
      <div class="vue-flow__node-default" :draggable="true" @dragstart="onDragStart($event, 'default')">中间节点</div>
      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'output')">结束节点</div>

      <div class="vue-flow__node-output" :draggable="true" @dragstart="onDragStart($event, 'group')">结束节点</div>
    </div>

    <!-- 文件工具栏部分 -->
    <div class="file-tool-kit">
      <div class="buttons">
        <button class="tool-button" title="保存" @click="onSave">
          <Icon name="save" />
          保存
        </button>
        <button class="tool-button" title="restore graph" @click="onRestore">
          <Icon name="restore" />
          恢复
        </button>
        <button class="tool-button" title="从文件中导入图" @click="importJson">
          <Icon name="add" />
          导入
        </button>
        <input type="file" ref="fileInput" accept=".json" style="display: none" @change="onFileChange" />
      </div>
    </div>

    <!-- 操作工具栏 -->
    <div class="operation-tool-kit">
      <el-button type="primary" @click="startAnalysis">开始分析</el-button>
    </div>
  </div>
</template>

<script setup>
import useDragAndDrop from '../../js/useDnD'
import Icon from '../Icon.vue'
import {defineEmits, ref} from 'vue' // Import defineEmits if not yet imported
import {ElMessage} from 'element-plus'

const { onDragStart } = useDragAndDrop()

const emit = defineEmits(['start-analysis', 'save-project', 'load-project']) // Define the emits

const fileInput = ref(null)
const importedFileName = ref("graph.json")

// 保存功能
function onSave() {
  emit("save-project")
}

// 恢复功能
function onRestore() {
  const restoredData = fromObject()
  if (restoredData) {
    ElMessage.success('Graph restored successfully!')
  } else {
    ElMessage.error('Failed to restore graph.')
  }
}

// 导入 JSON 功能
function importJson() {
  fileInput.value.click()
}

function onFileChange(event) {
  console.log("content");
  const file = event.target.files[0]
  console.log(file)
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      console.log(e)
      const content = e.target.result;
      console.log("content");
      console.log(content)
      emit("load-project", content)

    }
    reader.readAsText(file);

  }
}

// 文件保存方法
function saveAsNewFile(data, fileName) {
  const blob = new Blob([data], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = fileName
  link.click()
}

// 开始分析的逻辑，通过 $emit 通知父组件
function startAnalysis() {
  ElMessage({
    message: '准备开始分析...',
    type: 'info',
  });

  // 发射 start-analysis 事件，通知父组件
  emit('start-analysis');
}
</script>


<style scoped>
.head-bar-container {
  display: flex;
  background: rgb(241, 243, 244);
  width: 100%;
}

/* 横向排列工具栏和按钮 */
.nodes-tool-kit,
.file-tool-kit,
.operation-tool-kit {
  display: flex;
  align-items: center;
  gap: 10px; /* 工具之间的间距 */
  margin-bottom: 20px;
  margin-left: 5%;
}

/* 按钮样式 */
.tool-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #4CAF50; /* 按钮背景颜色 */
  color: white;
  border: none;
  padding: 10px 20px; /* 按钮的内边距，增大按钮尺寸 */
  font-size: 16px; /* 字体大小 */
  cursor: pointer;
  border-radius: 5px; /* 圆角 */
  transition: background-color 0.3s; /* 动态过渡效果 */
}

.tool-button:hover {
  background-color: #45a049; /* 鼠标悬停时的背景颜色 */
}

/* 使所有的工具横向对齐 */
.file-tool-kit .buttons {
  display: flex;
  align-items: center;
  gap: 15px; /* 按钮之间的间距 */
}
</style>
