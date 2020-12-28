<template>
  <div id="app" class="container" :class="containerClass">
    option
  </div>
</template>

<script>
const { version } = require("../../package.json");
export default {
  data() {
    return {
    };
  },
  mounted() {
    this.initOption();
  },
  methods: {
    initOption() {

    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  min-width: 630px;
  min-height: 480px;
  text-align: center;
  padding: 15px 0;
  font-size: 13px;
}
</style>
