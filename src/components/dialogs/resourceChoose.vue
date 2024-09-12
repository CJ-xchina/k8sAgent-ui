<template>
  <el-dialog title="选择一个 Pod" v-model="visible" width="50%" center @close="closeDialog">
    <!-- 已选择的 Pod 提示 -->
    <div v-if="selectedPod" style="margin-bottom: 10px;">
      已经选择：<strong>{{ selectedPod.name }}</strong>
    </div>

    <el-table :data="resourceList" @row-click="selectPod" style="width: 100%" :row-class-name="getRowClass">
      <el-table-column prop="name" label="Pod Name" width="180">
        <template #default="scope">
          <span :style="getRowStyle(scope.row)">
            {{ scope.row.name }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="namespace" label="Namespace" width="180"></el-table-column>
      <el-table-column prop="status" label="Status">
        <template #default="scope">
          <span :style="getStatusStyle(scope.row.status)">
            {{ scope.row.status }}
          </span>
        </template>
      </el-table-column>
    </el-table>

    <span slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" @click="confirmPodSelection">确认</el-button>
    </span>
  </el-dialog>
</template>

<script setup>
import {ref, watch} from "vue";
import {getPodDetails} from "@/js/remoteAPI";

// 接收父组件传递的 props
const props = defineProps({
  DialogVisible: Boolean
});

// 定义 emits，用于向父组件发送事件
const emit = defineEmits(['update:DialogVisible']);

const visible = ref(false);
const resourceList = ref([]);
const selectedPod = ref(null);

// 监听父组件传递的 DialogVisible 属性的变化
watch(() => props.DialogVisible, (newValue) => {
  if (newValue) {
    fetchPods();
  }
  visible.value = newValue;
});

// 获取 Pods 数据
const fetchPods = () => {
  getPodDetails().then((response) => {
    console.log()
    console.log(response)
    resourceList.value = response.map(pod => ({
      name: pod.name,
      namespace: pod.namespace,
      status: pod.status,
      id: pod.id || pod.name
    }));
  });
};

const getRowClass = (row) => {
  return selectedPod.value && selectedPod.value.id === row.id ? 'selected-row' : '';
};

// 设置 Pod 状态样式
const getStatusStyle = (status) => {
  return status === "Running"
      ? {backgroundColor: "#dff0d8", padding: "5px"}
      : {backgroundColor: "#f2dede", padding: "5px"};
};

// 设置选中行的背景颜色
const getRowStyle = (row) => {
  return selectedPod.value && selectedPod.value.id === row.id
      ? {backgroundColor: "#d3f9d8"} // 选中行的背景颜色
      : {};
};

// 选择 Pod
const selectPod = (row) => {
  if (selectedPod.value && selectedPod.value.id === row.id) {
    // 如果再次点击相同的 Pod，则取消选择
    selectedPod.value = null;
  } else {
    // 选择新的 Pod
    selectedPod.value = row;
  }
};

// 确认 Pod 选择
const confirmPodSelection = () => {
  if (!selectedPod.value) {
    alert("请至少选择一个 Pod 进行分析！");
    return;
  }
  console.log("inner");
  console.log(selectedPod.value)
  emit('confirm-selection', selectedPod.value); // 传递选中的 Pod 给父组件
  emit('update:DialogVisible', false); // 关闭对话框
  selectedPod.value = null; // 清空选择

};

// 关闭对话框
const closeDialog = () => {
  selectedPod.value = null; // 清空选择
  emit('update:DialogVisible', false); // 通过 emit 通知父组件关闭对话框
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

</style>
