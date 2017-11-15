<template>
  <div id="app">
    <!-- 头部 -->
    <m-header></m-header>

    <!-- 选项卡 -->
    <tab></tab>

    <!-- 路由页面 -->
    <keep-alive>
    	<router-view></router-view>
    </keep-alive>

    <!-- 播放器 -->
    <player></player>
    
  </div>
</template>

<script>
import MHeader from 'components/m-header/m-header'
import Tab from 'components/tab/tab'
import Player from 'components/player/player'

export default {
  name: 'app',
  components:{
  	MHeader,
  	Tab,
    Player
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">

</style>
