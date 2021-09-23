// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import iView from 'iview'
import store from './store' // 导入vuex文件
import api from './api' // 导入api接口
import '!style-loader!css-loader!less-loader!./theme/index.less'
import toast from './components/toast'
// 安装toast插件
Vue.use(toast)

Vue.config.productionTip = false
Vue.prototype.$api = api; // 将api挂载到vue的原型上
Vue.use(iView)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,//使用store
  template: '<App/>',
  components: { App }
})
