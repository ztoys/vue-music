<!-- 歌手详情页面 -->
<template>
	<transition name="slide">
		<!-- <div class="singer-detail"> -->
			<music-list
				:songs="songs"
				:title="title"
				:bg-image="bgImage"
			></music-list>
		<!-- </div> -->
	</transition>
</template>

<script>
	import {getSingerDetail} from 'src/api/singer'
	import {ERR_OK} from 'src/api/config'
	import {createSong} from 'src/common/js/song'
	import {mapGetters} from 'vuex'//vuex获取数据的语法糖

	import MusicList from 'src/components/music-list/music-list'

	export default{
		data(){
			return{
				songs:[]
			}
		},
		components:{
			MusicList
		},
		computed:{
			//vuex获取数据
			...mapGetters([
				'singer'
			]),
			title(){
				return this.singer.name
			},
			bgImage(){
				return this.singer.avatar
			}
		},
		created(){
			this._getDetail()
		},
		methods:{
			//获取歌手详情数据
			_getDetail(){
				//获取不到歌手ID时，也就是刷新时回到singer页面
				if(!this.singer.id){
					this.$router.push('/singer')
					return
				}
				//获取歌手详情数据
				getSingerDetail(this.singer.id).then((res)=>{
					if(res.code === ERR_OK){
						this.songs=this._normalizeSongs(res.data.list)
					}
				})
			},
			//songs数据处理
			_normalizeSongs(list){
				let ret = []
				list.forEach((item)=>{
					let musicData = item.musicData
					if(musicData.songid && musicData.albummid){
						ret.push(createSong(musicData))
					}
				})

				return ret
			}
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	@import "~common/stylus/variable"
	
	// .singer-detail
	// 	position: fixed
	// 	z-index: 100
	// 	top: 0
	// 	left: 0
	// 	bottom: 0
	// 	right: 0
	// 	background: $color-background
	.slide-enter-active,.slide-leave-active
		transition:all 0.3s
	.slide-enter,.slide-leave-to
		transform:translate3d(100%,0,0)
</style>