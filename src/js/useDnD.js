import {useVueFlow} from '@vue-flow/core'
import {ref, watch} from 'vue'

let id = 0

/**
 * @returns {string} - A unique id.
 */
function getId() {
  return `dndnode_${id++}`
}

/**
 * In a real world scenario you'd want to avoid creating refs in a global scope like this as they might not be cleaned up properly.
 * @type {{draggedType: Ref<string|null>, isDragOver: Ref<boolean>, isDragging: Ref<boolean>}}
 */
const state = {
  /**
   * The type of the node being dragged.
   */
  draggedType: ref(null),
  isDragOver: ref(false),
  isDragging: ref(false),
}

export default function useDragAndDrop(flow_id) {
  const { draggedType, isDragOver, isDragging } = state

  const {addNodes, screenToFlowCoordinate, onNodesInitialized, updateNode} = useVueFlow(flow_id)

  watch(isDragging, (dragging) => {
    document.body.style.userSelect = dragging ? 'none' : ''
  })

  function onDragStart(event, type) {
    if (event.dataTransfer) {
      event.dataTransfer.setData('application/vueflow', type)
      event.dataTransfer.effectAllowed = 'move'
    }

    draggedType.value = type
    isDragging.value = true

    document.addEventListener('drop', onDragEnd)
  }

  /**
   * Handles the drag over event.
   *
   * @param {DragEvent} event
   */
  function onDragOver(event) {
    event.preventDefault()

    if (draggedType.value) {
      isDragOver.value = true

      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move'
      }
    }
  }

  function onDragLeave() {
    isDragOver.value = false
  }

  function onDragEnd() {
    isDragging.value = false
    isDragOver.value = false
    draggedType.value = null
    document.removeEventListener('drop', onDragEnd)
  }

  /**
   * Handles the drop event.
   *
   * @param {DragEvent} event
   */
  function onDrop(event) {
    const position = screenToFlowCoordinate({
      x: event.clientX,
      y: event.clientY,
    });

    const nodeId = flow_id + getId();
    let newNode;

    // 根据不同的拖拽类型设置节点的 data
    if (draggedType.value === "group") {
      // 推理组节点，包含 question 和 description
      newNode = {
        id: nodeId,
        type: draggedType.value,
        position,
        data: {
          question: "", // 默认空字符串
          description: "", // 默认空字符串
        },
        isParent: true
      };
    } else if (draggedType.value === "default") {
      // 中间节点，包含 regex、question、description 和 action
      newNode = {
      id: nodeId,
      type: draggedType.value,
      position,
        data: {
          regex: "", // 默认空字符串
          question: "", // 默认空字符串
          description: "", // 默认空字符串
          action: "", // 默认空字符串
        },
        parentNode: ''
      };
    } else if (draggedType.value === "input" || draggedType.value === "output") {
      // 开始节点和结束节点，data 为 undefined
      newNode = {
        id: nodeId,
        type: draggedType.value,
        position,
        data: undefined, // 没有数据字段
      };
    }

    // 节点初始化后，调整节点位置，使其相对于鼠标居中
    const {off} = onNodesInitialized(() => {
      updateNode(nodeId, (node) => ({
        position: {
          x: node.position.x - node.dimensions.width / 2,
          y: node.position.y - node.dimensions.height / 2,
        },
      }));

      off(); // 移除事件监听器
    });

    console.log("Node added!");
    addNodes(newNode); // 将新节点添加到流中
  }

  return {
    draggedType,
    isDragOver,
    isDragging,
    onDragStart,
    onDragLeave,
    onDragOver,
    onDrop,
  }
}

