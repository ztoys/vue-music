<!-- 排行页面二级页 -->
<template>
	<transition name="slide">
		<music-list :title="title" :bg-image="bgImage" :songs="songs" :rank="true"></music-list>
	</transition>
</template>

<script>
	import MusicList from 'components/music-list/music-list'
	import {mapGetters} from 'vuex'
	import {getMusicList} from 'src/api/rank'
	import {ERR_OK} from 'src/api/config'
	import {createSong} from 'src/common/js/song'

	export default{
		components:{
			MusicList
		},
		data(){
			return{
				songs:[]
			}
		},
		computed:{
			title(){
				return this.topList.topTitle
			},
			bgImage(){
				if(this.songs.length){
					return this.songs[0].image
				}
				return ''
			},
			...mapGetters([
				'topList'
			]),
		},
		methods:{
			//获取数据
			_getTopList(){
				if(!this.topList.id){
					this.$router.push('/rank')
					return
				}
				getMusicList(this.topList.id).then((res)=>{
					if(res.code === ERR_OK){
						this.songs = this._normalizeSongs(res.songlist)
					}

				})
			},
			//转换数据
			_normalizeSongs(list){
				let ret = []
				list.forEach((item)=>{
					const MusicData = item.data
					if(MusicData.songid && MusicData.albumid){
						ret.push(createSong(MusicData))
					}
				})
				return ret
			}
		},
		created(){
			this._getTopList()
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	.slide-enter-active,.slide-leave-active
		transition: all 0.3s ease
	.slide-enter,.slide-leave-to
		transform: translate3d(100%,0,0)
</style>