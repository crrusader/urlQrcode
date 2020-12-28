<template>
  <div id="app" class="container" ref="app">
    <div ref="qrcode" id="qrcode"></div>
  </div>
</template>

<script>
const { version } = require("../../package.json");

import QRCode from "qrcodejs2";
export default {
  data() {
    return {
      qrcode: "",
      QRcode: "",
    };
  },
  mounted() {
    let _this = this;
    chrome.tabs.getSelected(null, function(tab) {
      _this.qrcode = tab.url;
      _this.init();
    });
  },
  methods: {
    init() {
      this.QRcode = new QRCode("qrcode", {
        width: 160,
        height: 160, // 高度
        text: this.qrcode, // 二维码内容
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.container {
  min-width: 150px;
  min-height: 150px;
  overflow-y: auto;
  padding: 10px 7px;
  box-sizing: border-box;
  position: relative;
  font-size: 12px;
}
</style>
