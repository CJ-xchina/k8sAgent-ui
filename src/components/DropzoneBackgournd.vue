<template>
  <div class="dropzone-background">
    <Background :size="2" :gap="20" pattern-color="#BDBDBD" />

    <div class="overlay">
      <slot />
    </div>
  </div>
</template>

<script>

import {defineComponent} from "vue";
import {Background} from "@vue-flow/background";

export default defineComponent({
  components: {Background}
})
</script>