<template>
  <!-- 只有当 visible 为 true 且 node 存在时才显示 el-dialog -->
  <el-dialog v-model="visible" title="Node Details" width="40%" @close="closeDialog">
    <div v-if="node">
      <p>ID: {{ node.id }}</p>
      <el-form :model="node.data" label-position="top">
        <!-- Question 字段，所有节点都显示 -->
        <el-form-item label="Question" v-if="node.data.question !== undefined">
          <el-input v-model="node.data.question" :disabled="!isEditable"></el-input>
        </el-form-item>

        <!-- Action 字段，仅当 action 存在时显示 -->
        <el-form-item label="Action" v-if="node.data.action !== undefined">
          <el-input v-model="node.data.action" :disabled="!isEditable"></el-input>
        </el-form-item>

        <!-- Description 字段，所有节点都显示 -->
        <el-form-item label="Description" v-if="node.data.description !== undefined">
          <el-input v-model="node.data.description" :disabled="!isEditable"></el-input>
        </el-form-item>

        <!-- Regex 字段，仅当 regex 存在时显示 -->
        <el-form-item label="Regex" v-if="node.data.regex !== undefined">
          <el-input v-model="node.data.regex" :disabled="!isEditable"></el-input>
        </el-form-item>
      </el-form>

      <h3>Connected Edges</h3>
      <div class="edges-container">
        <ul>
          <li v-for="edge in outgoingEdges" :key="edge.id" class="edge-item">
            <div class="edge-info">
              <!-- 左侧可编辑 edge.label -->
              <el-input v-model="edgeLabels[edge.id]" placeholder="Edit label"/>
            </div>
            <div class="edge-question">
              <!-- 右侧显示目标节点的 question -->
              <p>Question: {{ getTargetQuestion(edge.target) }}</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import {computed, ref, shallowRef, watch} from 'vue'
import {useVueFlow} from '@vue-flow/core'
import {ElMessage} from 'element-plus'


// 接收传入的节点信息
const props = defineProps({
  node: Object, // 通过父组件传递的节点,
  id: String
})

// 使用 shallowRef 确保引用关系，而不会发生空引用问题
const node = shallowRef(props.node || {})
// 对话框可见性
const visible = ref(false)
// 控制节点信息是否可编辑
const isEditable = ref(true)

// 用于存储初始数据
let initialData = ref(null)
// 存储每个 edge 的 label
const edgeLabels = ref({})

// 监控 props.node 的变化
watch(() => props.node, (newNode) => {
  if (newNode) {
    if (newNode.data === undefined) {
      return
    }
    node.value = newNode; // 更新 node 数据
    visible.value = true // 打开对话框

    // 保存初始数据的深拷贝
    initialData.value = JSON.parse(JSON.stringify(newNode.data))

    const {getConnectedEdges} = useVueFlow(props.id);
    
    // 初始化 edgeLabels 数据
    const edges = getConnectedEdges(newNode.id)
    edges.forEach(edge => {
      edgeLabels.value[edge.id] = edge.data.label || ''
    })
  }
})

// 关闭对话框的函数
function closeDialog() {
  // 比较当前数据和初始数据是否相同
  if (JSON.stringify(node.value.data) !== JSON.stringify(initialData.value)) {
    // 如果有变化，提交更改节点数据
    submitChanges()
  }

  // 更新每个 edge 的标签
  outgoingEdges.value.forEach(edge => {
    updateEdgeLabel(edge)
  })

  visible.value = false // 关闭对话框
  node.value = null // 清理 node
}

// 计算出当前节点的所有出发的边，并检查是否 node 存在
const outgoingEdges = computed(() => {
  if (!node.value || !node.value.id) {
    return [] // 如果 node 为空或没有 id，返回空数组
  }
  const {getConnectedEdges } = useVueFlow(props.id)

  const edges = getConnectedEdges(node.value.id)  // 从 VueFlow 获取所有边
  return edges.filter(edge => edge.source === node.value?.id)
})

// 查找目标节点的 question 信息，并检查目标节点是否存在
function getTargetQuestion(targetId) {
  const {findNode} = useVueFlow(props.id)

  const targetNode = findNode(targetId)
  return targetNode?.data?.question || 'No question found'
}

// 更新 edge label
function updateEdgeLabel(edge) {
  const {updateEdgeData} = useVueFlow(props.id)

  const newLabel = edgeLabels.value[edge.id]

  // 使用 UpdateEdgeData 更新边的数据，仅更新 label 字段
  updateEdgeData(edge.id, {label: newLabel}, {replace: true})

  ElMessage.success('Edge label updated successfully!')
}


// 提交修改后的节点数据
function submitChanges() {
  if (node.value) {
    const {updateNode} = useVueFlow(props.id)

    // 使用 updateNode 更新节点信息
    updateNode(node.value.id, {data: node.value.data})
    ElMessage.success('节点信息更新成功!')
  } else {
    ElMessage.error('Node not found')
  }
}
</script>

<style scoped>
.edges-container {
  margin-top: 20px;
  border-top: 1px solid #e4e4e4;
  padding-top: 10px;
}

.edge-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.edge-info {
  flex: 1;
  margin-right: 20px;
}

.edge-question {
  flex: 1;
  color: gray;
}
</style>
