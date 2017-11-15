import * as types from './mutation-type'
import {playMode} from 'src/common/js/config'
import {shuffle} from 'src/common/js/util'

//播放
export const selectPlay = function({commit,state},{list,index}){
//action自带commit方法和state属性
//接受一个有list属性和index属性的对象
	commit(types.SET_SEQUENCE_LIST,list)
	if(state.mode === playMode.random){
		let randomlist = shuffle(list)
		commit(types.SET_PLAYLIST,randomlist)
		index = findIndex(randomlist,list[index])
	}else{
		commit(types.SET_PLAYLIST,list)
	}
	commit(types.SET_CURRENT_INDEX,index)
	commit(types.SET_FULL_SCREEN,true)
	commit(types.SET_PLAYING_STATE,true)
}

//随机播放
export const randomPlay = function ({commit},{list}){
	commit(types.SET_PLAY_MODE, playMode.random)
	commit(types.SET_SEQUENCE_LIST,list)
	let randomlist = shuffle(list)
	commit(types.SET_PLAYLIST,randomlist)
	commit(types.SET_CURRENT_INDEX,0)
	commit(types.SET_FULL_SCREEN,true)
	commit(types.SET_PLAYING_STATE,true)
}

//搜索点击添加歌曲
export const insertSong = function({commit,state},song){
	let playlist = state.playlist.slice()
	let sequenceList = state.sequenceList.slice()
	let currentIndex = state.currentIndex
	//记录当前歌曲
	let currentSong = playlist[currentIndex]
	//查找当前列表中是否有待插入的歌曲并返回其索引
	let fpIndex = findIndex(playlist,song)
	//因为是插入歌曲，索引+1
	currentIndex++
	//插入这首歌到当前索引位置
	playlist.splice(currentIndex,0,song)
	//如果已经包含了这首歌
	if(fpIndex > -1){
		//如果当前插入的序号大于列表中的序号
		if(currentIndex > fpIndex){
			playlist.splice(fpIndex,1)
			currentIndex--
		}else{
			playlist.splice(fpIndex+1,1)
		}
	}

	let currentSIndex = findIndex(sequenceList,currentSong) + 1

	let fsIndex = findIndex(sequenceList,song)

	sequenceList.splice(currentIndex,0,song)

	if(fsIndex > -1){
		if(currentSIndex > fsIndex){
			sequenceList.splice(fsIndex,1)
		}else{
			playlist.splice(fsIndex+1,1)
		}
	}

	commit(types.SET_PLAYLIST,playlist)
	commit(types.SET_SEQUENCE_LIST,sequenceList)
	commit(types.SET_CURRENT_INDEX,currentIndex)
	commit(types.SET_FULL_SCREEN,true)
	commit(types.SET_PLAYING_STATE,true)
}

//找到对应的索引
function findIndex(list,song){
	return list.findIndex((item)=>{
		return item.id === song.id
	})
}