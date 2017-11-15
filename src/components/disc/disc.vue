<!-- 歌单详情页 -->
<template>
	<transition name="slide">
		<music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
	</transition>
</template>

<script>
	import MusicList from 'components/music-list/music-list'
	import {mapGetters} from 'vuex'
	import {getSongList} from 'src/api/recommend'
	import {ERR_OK} from 'src/api/config'
	import {createSong} from 'src/common/js/song'

	export default{
		data(){
			return {
				songs:[]
			}
		},
		components:{
			MusicList
		},
		computed:{
			title(){
				return this.disc.dissname
			},
			bgImage(){
				return this.disc.imgurl
			},
			...mapGetters([
				'disc'
			])
		},
		created(){
			this._getSongList()
		},
		methods:{
			//歌单歌曲数据
			_getSongList(){
				if(!this.disc.dissid){
					this.$router.push('/recommend')
					return
				}
				getSongList(this.disc.dissid).then((res)=>{
					if(res.code === ERR_OK){
						this.songs=this._normalizeSongs(res.cdlist[0].songlist)
					}
				})
			},
			_normalizeSongs(list){
				let ret = []
				list.forEach((musicData)=>{
					if(musicData.songid && musicData.albumid){
						ret.push(createSong(musicData))
					}
				})
				return ret
			}
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
	.slide-enter-active,.slide-leave-active
		transition: all 0.3s
	.slide-enter,.slide-leave-to
		transform:translate3d(100%,0,0)
</style>