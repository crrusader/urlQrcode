import Vue from "vue";
import App from "./App";
import axios from "axios";
import Element from 'element-ui'

Vue.use(Element)
Vue.prototype.$axios = axios;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  render: h => h(App)
});