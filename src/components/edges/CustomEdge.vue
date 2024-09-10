<template>
  <g>
    <!-- Edge Path with bezier curve -->
    <path
      class="react-flow__edge-path"
      :d="edgePath"
      stroke="#007acc"
      stroke-width="3"
      stroke-dasharray="5, 5"
      fill="none"
      marker-end="url(#arrowhead)"
    ></path>

    <!-- Edge Label -->
    <text
      :x="labelX"
      :y="labelY"
      class="react-flow__edge-text"
      text-anchor="middle"
    >
      {{ data.label }}
    </text>
  </g>

  <!-- Marker Definition for Arrowhead -->
  <defs>
    <marker
        id="arrowhead"
        markerWidth="10"
        markerHeight="7"
        refX="10"
        refY="3.5"
        orient="auto"
    >
      <polygon points="0 0, 10 3.5, 0 7" style="fill:#007acc;"/>
    </marker>
  </defs>
</template>

<script>
import {getBezierPath} from '@vue-flow/core';

export default {
  props: {
    id: String,
    sourceX: Number,
    sourceY: Number,
    targetX: Number,
    targetY: Number,
    sourcePosition: String,
    targetPosition: String,
    data: Object,
  },
  computed: {
    // Using Bezier path for smooth curves
    edgePath() {
      return getBezierPath({
        sourceX: this.sourceX,
        sourceY: this.sourceY,
        targetX: this.targetX,
        targetY: this.targetY,
        sourcePosition: this.sourcePosition,
        targetPosition: this.targetPosition,
      });
    },
    labelX() {
      return (this.sourceX + this.targetX) / 2;
    },
    labelY() {
      return (this.sourceY + this.targetY) / 2 - 10; // Adjusted to avoid overlap with edge
    },
  },
};
</script>

<style scoped>
.react-flow__edge-path {
  stroke: #007acc; /* Custom blue color */
  stroke-width: 3px;
  stroke-dasharray: 5, 5; /* Dotted line style */
}

.react-flow__edge-text {
  font-family: 'Arial, sans-serif';
  font-size: 14px;
  fill: #333; /* Darker text */
}

.react-flow__edge-textbg {
  fill: #fff; /* White background */
  stroke: #ccc; /* Light grey border */
  stroke-width: 0.5;
}
</style>
