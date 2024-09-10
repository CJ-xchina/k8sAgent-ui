<template>
  <Panel position="top-right">
    <div class="buttons">
      <button title="保存" @click="onSave">
        <Icon name="save"/>
      </button>
      <button title="restore graph" @click="onRestore">
        <Icon name="restore"/>
      </button>
      <button title="从文件中导入图" @click="importJson">
        <Icon name="add"/>
      </button>
      <input type="file" ref="fileInput" accept=".json" style="display:none" @change="onFileChange"/>
    </div>
  </Panel>
</template>

<script setup>
import {Panel, useVueFlow} from '@vue-flow/core'
import Icon from './Icon.vue'
import {ref} from "vue"
import {ElMessage} from 'element-plus'

const {addNodes, addEdges, toObject, fromObject} = useVueFlow()
const fileInput = ref(null)
const importedFileName = ref("graph.json") // 使用 ref 存储导入的文件名

function onSave() {
  console.log(importedFileName.value)
  // 无论是否有导入的文件路径，生成下载
  const data = JSON.stringify(toObject())
  saveAsNewFile(data, importedFileName.value)
}

function onRestore() {
  const flow = JSON.parse(sessionStorage.getItem('flowData')) // 使用 sessionStorage 临时存储图数据
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

      addNodes(newNodes) // 将节点添加到图中
      addEdges(newEdges) // 将边添加到图中
      importedFileName.value = file.name // 将文件名保存到 ref
      ElMessage.success("文件已成功导入: " + file.name)
    } catch (error) {
      console.error("Error reading JSON file", error)
      alert("Failed to parse the JSON file.")
    }
  }

  reader.readAsText(file) // 读取文件内容
}

function saveAsNewFile(data, fileName = "graph.json") {
  const blob = new Blob([data], {type: "application/json"})
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = fileName // 默认使用导入文件名或设置的默认文件名
  link.click()

  // 监听文件保存后的操作（无法直接获取保存路径，但可以提示保存成功）
  link.addEventListener("click", () => {
    ElMessage.success("文件已成功保存")
  })
}
</script>
