<!-- 歌曲进度条组件 -->
<template>
	<div class="progress-bar" ref="progressBar" @click="progressClick">
		<div class="bar-inner">
			<div class="progress" ref="progress"></div>
			<div 
				class="progress-btn-wrapper" 
				ref="progressBtn"
				@touchstart.prevent="progressTouchStart"
				@touchmove.prevent="progressTouchMove"
				@touchend.prevent="progressTouchEnd"
			>
				<div class="progress-btn"></div>
			</div>
		</div>
	</div>
</template>

<script>
	import {prefixStyle} from 'src/common/js/dom'

	const progressBtnWidth = 16 //小球的宽度
	const transform = prefixStyle('transform')

	export default{
		props:{
			percent:{
				type:Number,
				default:0
			}
		},
		watch:{
			percent(newPercent){
				if(newPercent>=0 && !this.touch.initiated){
					//进度条总宽带
					const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
					//偏移的宽度
					const offsetWidth = newPercent * barWidth
					//移动小球和进度条
					this._offset(offsetWidth)
				}
			}
		},
		created(){
			//共享小球触摸事件的数据
			this.touch = {}
		},
		methods:{
			/*小球触摸事件*/
			progressTouchStart(e){
				const touch = this.touch
				touch.initiated = true //用来判断已经初始化
				touch.startX = e.touches[0].pageX//横向坐标
				touch.left = this.$refs.progress.clientWidth//偏移的宽度
			},
			progressTouchMove(e){
				if(!this.touch.initiated){
					return
				}
				//进度条总宽带
				const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth

				//移动了多少距离
				const deltaX = e.touches[0].pageX - this.touch.startX 

				//移动的宽度
				const offsetWidth = Math.min(barWidth,Math.max(0,this.touch.left+deltaX))

				//移动小球和进度条
				this._offset(offsetWidth)

			},
			progressTouchEnd(e){
				this.touch.initiated = false

				//移动歌曲进度
				this._triggerPercent()
			},

			//进度条点击进度
			progressClick(e){
				//getBoundingClientRect方法返回元素的大小及其相对于视口的位置
				const rect = this.$refs.progressBar.getBoundingClientRect()
				const offsetWidth = e.pageX - rect.left
				this._offset(offsetWidth)
				
				this._triggerPercent()
			},

			//封装小球和进度条的移动方法
			_offset(offsetWidth){
				this.$refs.progress.style.width = `${offsetWidth}px`
				this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
			},

			//移动歌曲进度
			_triggerPercent(){
				//进度条总宽带
				const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth

				//传回移动的进度到父组件
				const percent = this.$refs.progress.clientWidth / barWidth
				this.$emit('percentChange',percent)
			}
		}
	}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .progress-bar
    height: 30px
    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)
      .progress
        position: absolute
        height: 100%
        background: $color-theme
      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px
        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>

