<!-- 搜索列表页 -->
<template>
	<scroll class="suggest" 
			:data="result" 
			:pullup="pullup"
			:beforeScroll="beforeScroll" 
			@scrollToEnd="searchMore"
			@beforeScroll="listScroll"
			ref="suggest"
		>
		<ul class="suggest-list">
			<li @click="selectItem(item)" class="suggest-item" v-for="item in result">
				<div class="icon">
					<i :class="getIconCls(item)"></i>
				</div>
				<div class="name">
					<p class="text" v-html="getDisplayName(item)"></p>
				</div>
			</li>
			<loading v-show="hasMore" title=""></loading>
		</ul>
		<div class="no-result-wrapper" v-show="!hasMore && !result.length">
			<no-result title="抱歉，暂无搜索结果"></no-result>
		</div>
	</scroll>
</template>

<script>
	import Scroll from 'src/base/scroll/scroll'
	import Loading from 'src/base/loading/loading'
	import Singer from 'src/common/js/singer'
	import NoResult from 'src/base/no-result/no-result'
	import {search} from 'src/api/search'
	import {ERR_OK} from 'src/api/config'
	import {createSong} from 'src/common/js/song'
	import {mapMutations,mapActions} from 'vuex'//vuex修改数据的语法糖

	const TYPE_SINGER = 'singer'//判断搜索的是歌手还是歌曲
	const perpage = 20//一次搜索多少个

	export default{
		props:{
			query:{
				type:String,
				default:''
			},
			showSinger:{
				type:Boolean,
				default:true
			}
		},
		components:{
			Scroll,
			Loading,
			NoResult
		},
		data(){
			return{
				page:1,//数据页数
				result:[],//数据
				pullup:true,//开启下拉刷新
				beforeScroll:true,//开启滚动时事件（用来移动端缩起键盘）
				hasMore:true//是否还有更多数据
			}
		},
		methods:{
			//搜索请求
			search(){
				this.page = 1
				this.hasMore = true
				this.$refs.suggest.scrollTo(0,0)
				search(this.query,this.page,this.showSinger,perpage).then((res)=>{
					if(res.code === ERR_OK){
						this.result = this._getResult(res.data)
						this._checkMore(res.data)
					}
				})
			},
			//下拉刷新加载更多
			searchMore(){
				if(!this.hasMore){
					return
				}
				this.page++
				search(this.query,this.page,this.showSinger,perpage).then((res)=>{
					if(res.code === ERR_OK){
						this.result = this.result.concat(this._getResult(res.data))
						this._checkMore(res.data)
					}
				})
			},
			//点击跳转页面
			selectItem(item){
				if(item.type === TYPE_SINGER){
					const singer = new Singer({
						id:item.singermid,
						name:item.singername
					})
					this.$router.push({
						path:`/search/${singer.id}`
					})
					this.setSinger(singer)
				}else{
					this.insertSong(item)
				}
			},
			//检查还有没有数据
			_checkMore(data){
				const song = data.song
				if(!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum){
					this.hasMore = false
				}
			},
			//转换数据形式
			_getResult(data){
				let ret = []
				if(data.zhida && data.zhida.singerid){
					ret.push({...data.zhida,...{type:TYPE_SINGER}})
				}
				if(data.song){
					ret = ret.concat(this._normalizeSongs(data.song.list))
				}
				return ret
			},
			//判断图标
			getIconCls(item){
				if(item.type === TYPE_SINGER){
					return 'icon-mine'
				}else{
					return 'icon-music'
				}
			},
			//显示歌手或歌曲
			getDisplayName(item){
				if(item.type === TYPE_SINGER){
					return item.singername
				}else{
					return `${item.name}-${item.singer}`
				}
			},
			//转换数据形式
			_normalizeSongs(list){
				let ret = []
				list.forEach((musicData)=>{
					if(musicData.songid && musicData.albumid){
						ret.push(createSong(musicData))
					}
				})
				return ret
			},
			//滚动列表时
			listScroll(){
				this.$emit('listScroll')
			},
			//vuex修改数据
			...mapMutations({
				setSinger : 'SET_SINGER'
			}),
			...mapActions([
				'insertSong'
			])
		},
		watch:{
			query(){
				this.search()
			}
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height: 100%
    overflow: hidden
    .suggest-list
      padding: 0 30px
      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px
      .icon
        flex: 0 0 30px
        width: 30px
        [class^="icon-"]
          font-size: 14px
          color: $color-text-d
      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden
        .text
          no-wrap()
    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>