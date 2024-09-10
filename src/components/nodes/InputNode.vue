<template>
  <div class="input-node">
    <p>{{ data.question }}</p> <!-- 显示 question 字段 -->
    <!-- Source handle at the bottom for outgoing connections -->
    <Handle id="input_a" type="source" :position="Position.Left"/>
    <Handle id="input_b" type="source" :position="Position.Bottom"/>
    <Handle id="input_c" type="source" :position="Position.Right"/>
  </div>
</template>

<script setup>
import {Handle, Position} from '@vue-flow/core';
import {onMounted} from "vue";

const props = defineProps({
  id: String,
  type: Number,
  position: Object,
  data: Object,
})


onMounted(() => {
  console.log(props.node)
});
</script>

<style scoped>
.input-node {
  background-color: #e6f7ff;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
