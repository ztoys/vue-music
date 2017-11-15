import {commonParams} from './config'
import axios from 'axios'

//获取歌词
export function getLyric(mid){
	const url = '/api/lyric'

	const data = Object.assign({},commonParams,{
		songmid:mid,
		pcachetime: +new Date(),
		platform:'yqq',
		hostUin: 0,
		needNewCode:0,
		format:'json'
	})

	return axios.get(url,{
		params:data
	}).then((res)=>{
		return Promise.resolve(res.data)
		/*
		Promise.resolve(foo)
		相当于
		new Promise((resolve, reject) => {
		    foo.then(resolve, reject)
		});
		*/
	})
}