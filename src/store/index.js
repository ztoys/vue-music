import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getter'
import state from './state'
import mutations from './mutations'
//每次修改数据都会输出log
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex)

//npm run dev 就是dev环境，npm run build 就是production环境
const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
	actions,
	getters,
	state,
	mutations,
	strict:debug,//vuex严格模式，检测state的修改是不是来源于mutations（性能损耗，线上关闭）
	plugins:debug ? [createLogger()] : []
})