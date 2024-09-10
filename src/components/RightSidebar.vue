<template>
  <div class="right-sidebar">
    <el-button type="success" class="start-analysis-btn" @click="startAnalysis">Start Analysis</el-button>

    <el-radio-group v-model="resourceType" class="resource-switcher">
      <el-radio-button label="pod">Pod</el-radio-button>
      <el-radio-button label="service">Service</el-radio-button>
      <el-radio-button label="deployment">Deployment</el-radio-button>
    </el-radio-group>

    <div class="resource-list">
      <div v-for="node in filteredNodes" :key="node.id" :class="{'selected': selectedNodeId === node.id}"
           @click="selectNode(node)" class="resource-item">
        <p>{{ node.data.question }} - </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['start-analysis'])


function startAnalysis() {
  emit('start-analysis')
}

</script>

<style scoped>
.right-sidebar {
  width: 300px;
  border-left: 1px solid #d3d3d3;
  padding: 20px;
  background: #f9f9f9;
}

.start-analysis-btn {
  width: 100%;
  margin-bottom: 20px;
}

.resource-switcher {
  margin-bottom: 20px;
}

.resource-item {
  padding: 10px;
  margin-bottom: 10px;
  cursor: pointer;
  background: #fff;
  border: 1px solid #d3d3d3;
}

.resource-item.selected {
  background-color: #cce5ff;
}
</style>
