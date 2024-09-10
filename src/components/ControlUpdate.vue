<template>
  <Panel position="top-right">
    <div class="buttons">
      <button title="save graph" @click="onSave">
        <Icon name="save"/>
      </button>
      <button title="restore graph" @click="onRestore">
        <Icon name="restore"/>
      </button>
      <button title="import graph" @click="importJson">
        <Icon name="add"/>
      </button>
      <input type="file" ref="fileInput" accept=".json" style="display:none" @change="onFileChange"/>
    </div>
  </Panel>
</template>

<script setup>
import {Panel, useVueFlow} from '@vue-flow/core'
import Icon from './Icon.vue'
import {ref} from "vue";

const flowKey = 'vue-flow--save-restore'
const pathKey = 'vue-flow--file-path'

const {nodes, edges, addNodes, addEdges, dimensions, toObject, fromObject} = useVueFlow()
const fileInput = ref(null)

function onSave() {
  const path = localStorage.getItem(pathKey)
  if (path) {
    // 如果有保存的路径，则保存到该路径（这里无法直接操作本地文件系统，除非使用 Electron 或 Node.js）
    const data = JSON.stringify(toObject())
    saveToFile(path, data)
  } else {
    alert("No file path found. Please import a graph first.")
  }
}

function onRestore() {
  const flow = JSON.parse(localStorage.getItem(flowKey))
  console.log(flow)
  if (flow) {
    fromObject(flow)
  }
}

function importJson() {
  fileInput.value.click() // 触发文件选择框
}

function onFileChange(event) {
  const file = event.target.files[0]
  const reader = new FileReader()

  reader.onload = (e) => {
    try {
      const json = JSON.parse(e.target.result)
      const newNodes = json.nodes || [] // 假设 JSON 文件中有 nodes 字段
      const newEdges = json.edges || [] // 假设 JSON 文件中有 edges 字段

      console.log(newNodes);
      console.log(newEdges)
      addNodes(newNodes) // 将节点添加到图中
      addEdges(newEdges) // 将边添加到图中
      localStorage.setItem(pathKey, file.name) // 保存文件路径到 localStorage
    } catch (error) {
      console.error("Error reading JSON file", error)
      alert("Failed to parse the JSON file.")
    }
  }

  reader.readAsText(file) // 读取文件内容
}

function saveToFile(path, data) {
  const blob = new Blob([data], {type: "application/json"})
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = path
  link.click()
}

</script>
