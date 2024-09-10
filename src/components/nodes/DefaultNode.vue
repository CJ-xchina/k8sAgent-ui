<template>
  <div class="default-node">
    <p>{{ data.question }}</p> <!-- 显示 question 字段 -->
    <!-- Source and target handles for connections -->
    <Handle id="default-left" type="source" :position="Position.Left" />
    <Handle id="default-right" type="source" :position="Position.Right" />
    <Handle id="default-bottom" type="target" :position="Position.Bottom" />
    <Handle id="default-top" type="target" :position="Position.Top" />
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core';

const props = defineProps({
  id: String,
  type: Number,
  position: Object,
  data: Object,
});
</script>

<style scoped>
.default-node {
  background-color: #f0f8ff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
