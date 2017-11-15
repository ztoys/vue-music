// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import store from './store'//Vuex

import fastclick from 'fastclick'//解决移动端300ms延迟
import VueLazyLoad from 'vue-lazyload'//懒加载
// import vConsole from 'vconsole'//console

Vue.config.productionTip = false

import 'common/stylus/index.styl'

fastclick.attach(document.body)

Vue.use(VueLazyLoad,{
	loading:require('common/image/default.png')
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
