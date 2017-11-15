
import {playMode} from 'src/common/js/config'

//vuex数据
const state = {
	singer:{},//歌手数据

	/*歌曲播放数据*/
	playing:false,			//播放状态（是否播放）
	fullScreen:false,		//是否全屏
	playlist:[],			//歌曲列表
	sequenceList:[],		//歌曲顺序列表
	mode:playMode.sequence, //播放状态（顺序播放、循环播放、随机播放）
	currentIndex:-1,		//播放索引（确定在播放哪首歌）
	disc:{},     			//歌单数据
	topList:{}				//排行榜歌单列表数据
}

export default state