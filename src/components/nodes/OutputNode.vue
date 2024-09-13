<template>
  <div class="output-node">
    <p>END</p> <!-- 显示 question 字段 -->
    <!-- Source handle at the bottom for outgoing connections -->
    <Handle id="output-left" type="target" :position="Position.Left" />
    <Handle id="output-right" type="target" :position="Position.Right" />
    <Handle id="output-bottom" type="target" :position="Position.Bottom" />
    <Handle id="output-top" type="target" :position="Position.Top" />
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
.output-node {
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
