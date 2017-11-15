<!-- better-scroll抽象组件 -->
<template>
	<div ref="wrapper">
		<slot></slot>
	</div>
</template>

<script>
	import BScroll from 'better-scroll'
	export default{
		props:{
			/*probeType:
				1：滚动的时候会派发scroll事件，会截流。
				2：滚动的时候实时派发scroll事件，不会截流。 
				3：除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
			*/
			probeType:{
				type:Number,
				default:1
			},
			//是否可以点击
			click:{
				type:Boolean,
				default:true
			},
			//数据
			data:{
				type:Array,
				default:null
			},
			//是否返回scroll偏移数据
			listenScroll:{
				type:Boolean,
				default:false
			},
			//是否开启上拉刷新
			pullup:{
				type:Boolean,
				type:false
			},
			//滚动列表时
			beforeScroll:{
				type:Boolean,
				default:false
			}
		},
		mounted(){
			setTimeout(()=>{
				this._initScroll()
			},20)
		},
		methods:{
			_initScroll(){
				if(!this.$refs.wrapper){
					return
				}
				this.scroll = new BScroll(this.$refs.wrapper,{
					probeType:this.probeType,
					click:this.click
				})

				if(this.listenScroll){
					let me = this
					this.scroll.on('scroll',(pos)=>{
						me.$emit('scroll',pos)
					})
				}

				//滚动列表时
				if(this.beforeScroll){
					this.scroll.on('beforeScrollStart',()=>{
						this.$emit('beforeScroll')
					})
				}

				//scrollEnd是滚动停止
				//scrollToEnd是滚到底步
				if(this.pullup){
					this.scroll.on('scrollEnd',()=>{
						if(this.scroll.y <= (this.scroll.maxScrollY + 50)){
							this.$emit('scrollToEnd')
						}
					})
				}
			},
			enable(){
				this.scroll && this.scroll.enable()
			},
			disable(){
				this.scroll && this.scroll.disable()
			},
			refresh(){
				this.scroll && this.scroll.refresh()
			},
			scrollTo(){
				this.scroll && this.scroll.scrollTo.apply(this.scroll,arguments)
			},
			scrollToElement(){
				this.scroll && this.scroll.scrollToElement.apply(this.scroll,arguments)
			}
		},
		watch:{
			data(){
				setTimeout(()=>{
					this.refresh()
				},20)
			}
		}
	}
</script>

<style>
</style>