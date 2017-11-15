import jsonp from 'common/js/jsonp'
import {commonParams,options} from './config'
import axios from 'axios'

//获取轮播图数据
export default function getRecommend(){
	const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'

	const data = Object.assign({},commonParams,{
		platform: 'h5',
		uin: 0,
		needNewCode: 1
	})

	return jsonp(url,data,options)
}

//获取推荐歌单数据
export function getDiscList(){
	const url = "api/getDiscList"
	// const url = "https://bird.ioliu.cn/v1?url=https://c.y.qq.com/splcloud/fcgi-bin/fcg_get_diss_by_tag.fcg"

	const data = Object.assign({},commonParams,{
		platform: 'yqq',
		hostUin:0,
		sin:0,
		ein:29,
		sortId:5,
		needNewCode:0,
		categoryId:10000000,
		rnd:Math.random(),
		format:'json'
	})
	return axios.get(url,{
		params:data
	}).then((res) => {
		return Promise.resolve(res.data)
		// return res
	})
}

//获取推荐歌单歌曲数据
export function getSongList(disstid){
	const url = "api/getSongList"

	const data = Object.assign({},commonParams,{
		disstid,
		type:1,
		json:1,
		utf8:1,
		onlysong:0,
		platform:'yqq',
		hostUin:0,
		needNewCode: 0,
		format:'json'
	})

	return axios.get(url,{
		params:data
	}).then((res) => {
		return Promise.resolve(res.data)
	})

	// return jsonp(url,data,options)
}