<!-- 播放器组件 -->
<template>
	<div class="player" v-show="playlist.length>0">
		<transition name="normal">
			<div class="normal-player" v-show="fullScreen"><!-- 展开的播放器 -->
				<div class="background">
					<img width="100%" height="100%" :src="currentSong.image">
				</div>
				<div class="top">
					<div class="back" @click="back">
						<i class="icon-back"></i>
					</div>
					<h1 class="title" v-html="currentSong.name"></h1>
					<h2 class="subtitle" v-html="currentSong.singer"></h2>
				</div>
				<div class="middle" 
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
					<div class="middle-l" ref="middleL">
						<div class="cd-wrapper">
							<div class="cd" :class="cdCls">
								<img class="image" :src="currentSong.image">
							</div>
						</div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
					</div>
          <!-- 歌词 -->
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p 
                  class="text" 
                  :class="{'current':currentLineNum === index}"
                  ref="lyricLine" 
                  v-for="(line,index) in currentLyric.lines"
                >
                {{line.txt}}</p>
              </div>
            </div>
          </scroll>
				</div>
				<div class="bottom">
          <!-- 滑块 -->
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>

					<!-- 歌曲进度条 -->
					<div class="progress-wrapper">
						<span class="time time-l">{{format(currentTime)}}</span>
						<div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
						<span class="time time-r">{{format(currentSong.duration)}}</span>
					</div>

					<!-- 歌曲播放上一首下一首图标 -->
					<div class="operators">
						<div class="icon i-left" @click="changeMode">
							<i :class="iconMode"></i>
						</div>
						<div class="icon i-left" :class="disableCls">
							<i @click="prev" class="icon-prev"></i>
						</div>
						<div class="icon i-center" :class="disableCls">
							<i @click="togglePlaying" :class="playIcon"></i>
						</div>
						<div class="icon i-right" :class="disableCls">
							<i @click="next" class="icon-next"></i>
						</div>
						<div class="icon i-right">
							<i class="icon icon-not-favorite"></i>
						</div>
					</div>
				</div>
			</div>
		</transition>
		<transition name="mini">
			<div class="mini-player" @click="open" v-show="!fullScreen"><!-- 缩小的播放器 -->
				<div class="icon" >
					<img :class="cdCls" width="40" height="40" :src="currentSong.image">
				</div>
				<div class="text">
					<h2 class="name" v-html="currentSong.name"></h2>
					<p class="desc" v-html="currentSong.singer"></p>
				</div>
				<div class="control">
          <progress-circle :radius="32" :percent="percent">
					 <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
				</div>
				<div class="control">
					<i class="icon-playlist"></i>
				</div>
			</div>
		</transition>
		<audio 
			ref="audio" 
			:src="currentSong.url" 
			@play="ready"
			@error="error"
			@timeupdate="updateTime"
      @ended="end"
      @canplaythrough="audioReady"
		>
			<!-- canplay加载到播放的事件 -->
			<!-- error请求错误的事件 -->
			<!-- updateTime歌曲进度事件 -->
      <!-- ended歌曲播放结束时 -->
		</audio>
	</div>
</template>

<script>
  //组件
  import ProgressBar from 'src/base/progress-bar/progress-bar'
  import ProgressCircle from 'src/base/progress-circle/progress-circle'
  import Scroll from 'src/base/scroll/scroll'
  //封装的函数
  import {playMode} from 'src/common/js/config'
  import {shuffle} from 'src/common/js/util'
  import {prefixStyle} from 'src/common/js/dom'
  //第三方库
  import Lyric from 'lyric-parser'
  //vuex
	import {mapGetters,mapMutations} from 'vuex'

  const transform = prefixStyle('transform')
  const transitionDuration = prefixStyle('transitionDuration')

	export default{
		data(){
			return{
				songReady:false,//歌曲是否可以播放状态
				currentTime:0,//歌曲时间
        currentLyric:null,//歌词
        currentLineNum:0,//歌词当前歌句高亮
        currentShow: 'cd',//当前显示图片还是歌词
        playingLyric:''//歌曲当前唱到的歌句
			}
		},
    components:{
      ProgressBar,
      ProgressCircle,
      Scroll
    },
    created(){
      this.touch = {}
    },
		computed:{
			//暂停时和播放时图标
			playIcon(){
				return this.playing ? 'icon-pause' : 'icon-play'
			},
      //播暂停时和播放时图标（缩小后的播放器）
			miniIcon(){
				return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
			},
      //播放模式图标
      iconMode(){
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },

			//图片旋转
			cdCls(){
				return this.playing ? 'play' : 'play pause'
			},
			//歌曲地址请求失败样式
			disableCls(){
				return this.songReady ? '' : 'disable'
			},
      //进度条百分比
      percent(){
        return this.currentTime / this.currentSong.duration
      },

			//歌曲状态数据
			...mapGetters([
				'fullScreen',
				'playlist',
				'currentSong',//store/getter.js
				'playing',
				'currentIndex',
        'mode',
        'sequenceList'
			])
		},
		methods:{
			//缩小播放器
			back(){
				this.setFullScreen(false)
			},
			//点开播放器
			open(){
				this.setFullScreen(true)
			},
			//暂停继续播放
			togglePlaying(){
        if(!this.songReady){
          return
        }
				this.setPlayingState(!this.playing)
        if(this.currentLyric){
          this.currentLyric.togglePlay()
        }
			},
      //选择播放模式
      changeMode(){
        const mode = (this.mode + 1 ) % 3
        this.setPlayMode(mode)//修改状态

        let list = null
        if(mode === playMode.random){
          list = shuffle(this.sequenceList)
        }else{
          list = this.sequenceList
        }
        this.resetCurrentIndex(list)
        this.setPlayList(list)
      },
      //修改到歌曲对应的索引
      resetCurrentIndex(list){
        let index = list.findIndex((item)=>{
          return item.id === this.currentSong.id
        })
        this.setCurrentIndex(index)
      },

			//防止过快点击下一首发生错误
			ready(){
				this.songReady = true
			},
			//歌曲地址请求错误的事件,避免按钮不能点击
			error(){
				this.songReady = true
			},
			//下一首歌
			next(){
				//防止过快点击
				if(!this.songReady){
					return
				}
        if(this.playlist.length===1){
          this.loop()
          return 
        }else{
          let index = this.currentIndex + 1
          if(index === this.playlist.length){
            index = 0
          }
          this.setCurrentIndex(index)
          //暂停播放icon
          if(!this.playing){
            this.togglePlaying()
          }
        }
				this.songReady = false
			},
			//上一首歌
			prev(){
				//防止过快点击
				if(!this.songReady){
					return
				}
        if(this.playlist.length===1){
          this.loop()
          return
        }else{
          let index = this.currentIndex - 1
          if(index === -1){
            index = this.playlist.length
          }
          this.setCurrentIndex(index)
          //暂停播放icon
          if(!this.playing){
            this.togglePlaying()
          }
        }
				this.songReady = false
			},
      //歌曲播放完时(播放模式)
      end(){
        if(this.mode === playMode.loop ){
          this.loop()
        }else{
          this.next()
        }
      },
      //单曲循环
      loop(){
        this.$refs.audio.currentTime = 0
        this.$refs.audio.play()
        if(this.currentLyric){
          this.currentLyric.seek(0)
        }
      },
			// 歌曲进度
			updateTime(e){
				this.currentTime = e.target.currentTime
			},
      //移动歌曲进度
      onProgressBarChange(percent){
        const currentTime= this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        //移动后播放
        if(!this.playing){
          this.togglePlaying()
        }
        if(this.currentLyric){
          this.currentLyric.seek(currentTime*1000)
        }
      },

			//修改vuex歌曲状态数据
			...mapMutations({
				setFullScreen:'SET_FULL_SCREEN',
				setPlayingState:'SET_PLAYING_STATE',
				setCurrentIndex: 'SET_CURRENT_INDEX',
        setPlayMode:'SET_PLAY_MODE',
        setPlayList:'SET_PLAYLIST'
			}),

			//将时间戳转为分秒
			format(time){
				time = time | 0
				const minute = time /60 | 0
				const second = this._pad(time % 60)
				return `${minute}:${second}`
			},
			//个位数补零(2位数)
			_pad(num,n=2){
				let len = num.toString().length
				while(len<n){
					num = '0'+num
					len++
				}
				return num
			},
      //歌词展示
      getLyric(){
        this.currentSong.getLyric().then((lyric)=>{
          if(this.currentSong.lyric !== lyric){
            return
          }
          this.currentLyric = new Lyric(lyric,this.handleLyric)
          if(this.playing){
            this.currentLyric.play()
          }
        }).catch(()=>{
          this.currentLyric = null
          this.playingLyric = ''
          this.currentLineNum = 0
        })
      },
      //歌词高亮
      handleLyric({lineNum,txt}){
        this.currentLineNum = lineNum
        if(lineNum > 5){//固定歌词到上下中间
          let lineEl = this.$refs.lyricLine[lineNum-5]
          this.$refs.lyricList.scrollToElement(lineEl,1000)
        }else{
          this.$refs.lyricList.scrollTo(0,0,1000)
        }
        //当前播放到的歌词
        this.playingLyric = txt
      },

      //滑动切换图片或歌词
      middleTouchStart(e){
        this.touch.initiated = true //判断初始化
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e){
        if(!this.touch.initiated){
          return
        }
        const touch = e.touches[0]
        const deltaX = touch.pageX - this.touch.startX
        const deltaY = touch.pageY - this.touch.startY
        if(Math.abs(deltaY)>Math.abs(deltaX)){
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        const offsetWidth = Math.min(0,Math.max(-window.innerWidth,left+deltaX))
        //歌词左滑
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = 0
        //图片渐隐
        this.$refs.middleL.style.opacity = 1-this.touch.percent
        this.$refs.middleL.style[transitionDuration] = 0

      },
      middleTouchEnd(){
        let offsetWidth
        let opacity
        if(this.currentShow === 'cd'){
          if(this.touch.percent > 0.1){
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric'
          }else{
            offsetWidth = 0
            opacity = 1
          }
        }else{
          if(this.touch.percent < 0.9){
            offsetWidth = 0
            this.currentShow = 'cd'
            opacity = 1
          }else{
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        //歌词左滑
        const time = 300
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
        //图片渐隐
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style[transitionDuration] = `${time}ms`
      },

      //
      isApple(){
        let isApple = false
        let u = window.navigator.userAgent;
        var ap = /(iPhone)|(iPad)|(iPod)|(Mac)/i;
        if(ap.test(u)){
          isApple = true;
        }
        return isApple
      },
      audioReady(){
        alert("ok")
      }

		},
		watch:{
			currentSong(newSong,oldSong){
        if(newSong.id === oldSong.id){
          return 
        }
        if(this.currentLyric){
          this.currentLyric.stop()
        }
        clearTimeout(this.timer)
				this.timer = setTimeout(()=>{
          this.$refs.audio.play()
          this.getLyric()
				},1000)
			},
			playing(newPlaying){
				const audio = this.$refs.audio

				this.$nextTick(()=>{
          newPlaying ? audio.play() : audio.pause()
				})
			}
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state: paused
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>