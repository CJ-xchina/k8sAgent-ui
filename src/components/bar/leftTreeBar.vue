<template>
  <div>
    <!-- Buttons to add category and flow -->
    <el-button type="primary" @click="addCategoryPrompt">添加类别</el-button>
    <el-button type="primary" @click="showAddFlowDialog">添加流程图</el-button>

    <!-- Tree display for categories and flowcharts -->
    <el-tree
      :data="treeData"
      node-key="id"
      :props="defaultProps"
      :render-content="renderContent"
      @node-click="handleNodeClick"
    ></el-tree>

    <!-- Single dialog for adding flowchart with all fields -->
    <el-dialog title="添加流程图" v-model="flowDialogVisible">
      <el-form :model="flowForm">
        <el-form-item label="流程图名称">
          <el-input v-model="flowForm.name" placeholder="请输入流程图名称"></el-input>
        </el-form-item>
        <el-form-item label="流程图用途">
          <el-input v-model="flowForm.purpose" placeholder="请输入流程图用途"></el-input>
        </el-form-item>
        <el-form-item label="选择类别">
          <el-select v-model="flowForm.category" placeholder="请选择类别">
            <el-option
              v-for="category in topLevelCategories"
              :key="category.id"
              :label="category.label"
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="flowDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddFlow">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue'
import {ElMessageBox, ElMessage} from 'element-plus'
import {v4 as uuidv4} from 'uuid'

// Props to receive tree data and functions to add category and flow
const props = defineProps({
  treeData: {
    type: Array,
    required: true
  },
  addCategory: {
    type: Function,
    required: true
  },
  addFlow: {
    type: Function,
    required: true
  }
})

// Emit the flowchart ID to the parent
const emit = defineEmits(['flowchart-click'])

// Default properties for el-tree
const defaultProps = {
  children: 'children',
  label: 'label'
}

// State variables
const selectedNodeId = ref(null)
const selectedCategory = ref(null) // Store selected category
const flowDialogVisible = ref(false) // Control dialog visibility for adding flow
const flowForm = ref({name: '', purpose: '', category: null}) // Store flow data

// Get top-level categories (excluding 'default')
const topLevelCategories = computed(() => {
  return props.treeData.filter(node => node.id !== 'default')
})

// Handle node click event
const handleNodeClick = (node) => {
  selectedNodeId.value = node.id
}

// Check if a category name already exists
const categoryExists = (name) => {
  return props.treeData.some(node => node.label === name)
}

// Show dialog to add flow with all inputs in one
const showAddFlowDialog = () => {
  flowDialogVisible.value = true
}

// Confirm the addition of the new flow
const confirmAddFlow = () => {
  const {name, purpose, category} = flowForm.value

  if (!name) {
    ElMessage.warning('流程图名称不能为空')
    return
  }
  if (!purpose) {
    ElMessage.warning('流程图用途不能为空')
    return
  }
  if (!category) {
    ElMessage.warning('请选择一个类别')
    return
  }

  const flowData = {
    id: uuidv4(),
    name,
    category,
    purpose
  }

  // Call parent function to add the flow to the selected category
  props.addFlow(category, flowData)
  ElMessage.success('流程图添加成功')
  flowDialogVisible.value = false

  // Reset form fields
  flowForm.value = {name: '', purpose: '', category: null}
}

// Custom render function to display both category names and flowchart names with click event
const renderContent = (h, {node, data, store}) => {
  if (data.name) {
    return h('span', {
      onClick: () => emit('flowchart-click', data.id) // Emit the flowchart ID when clicked
    }, [
      h('span', data.name), // Display flowchart name
      h('span', ` - 用途: ${data.purpose}`) // Optionally display flowchart purpose
    ])
  } else {
    // Otherwise, it's a category and should display the 'label'
    return h('span', data.label)
  }
}

// Prompt to add a new category
const addCategoryPrompt = () => {
  ElMessageBox.prompt('请输入类别名称', '添加类别', {
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(({value}) => {
    if (value) {
      if (categoryExists(value)) {
        ElMessage.warning('类别名称已存在，请使用其他名称')
        return
      }
      // Add new category to the top level
      props.addCategory({id: uuidv4(), label: value, children: []})
      ElMessage.success('类别添加成功')
    }
  }).catch(() => {
    ElMessage.info('取消操作')
  })
}
</script>

<style scoped>
.tree-container {
  padding: 20px;
}

.button {
  margin: 10px 0;
}
</style>
