<template>
  <div>
    <NodeResizer min-width="100" min-height="30" />

    <Handle type="target" :position="Position.Left" />
    <div style="padding: 10px">{{ data.question }}</div>
    <Handle type="source" :position="Position.Right" />
  </div>
</template>

<script setup>
import { Handle, Position } from '@vue-flow/core';
import { NodeResizer } from '@vue-flow/node-resizer';

defineProps(['data']);
</script>
