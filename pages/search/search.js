import global from "../../utils/global"
import api from "../../utils/api"
Page({

  data: {
    hotSearch:[],//热门搜索列表
    searchs:[],//近期
    isLogin:false,
    searchsVal:""
  },
  onLoad: function (options) {

  },

  onShow: function () {
    this._getHotSearch(),
    this._getStorageSearch()
  },
  async _getHotSearch(){
    let res = await api._find(global.table.recipeTable,{status:1},1,6,{field:"views",sort:"desc"})
    // console.log(res);
    this.setData({
      hotSearch:res.data
    })
  }, 
  //获取近期搜索内容
   _getStorageSearch(){
    let openid = wx.getStorageSync('openid')||null;
    if (openid == null) {
      this.setData({
        isLogin:false,
      })
      return;
    }
    // 先去获取
    let searchs = wx.getStorageSync('searchs')||[];
    this.setData({
      searchs,
      isLogin:true
    })
  },
  //进入详情
  _toDetailPage(e){
    let {id,title} = e.currentTarget.dataset;
    let searchs = wx.getStorageSync('searchs') || [];
    let  ind =  searchs.findIndex((item)=>{
      return item ==  title;
    })
    // -1 代表没有 
    if(ind ==  -1){
      //没有,在前面插入
      searchs.unshift(title)
    }else{
      // 已经存在了
      searchs.splice(ind,1) //先从所在位置删除
      searchs.unshift(title)// 在数组最前面添加
    }

    // console.log(searchs)
    // 将searchs存入到缓存中
    wx.setStorageSync('searchs', searchs)
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&title=${title}`,
    })
  },
  //获取近期搜索内容
  _recipelistPage(e){
    // console.log(e);
    let {id=null,title,tag,tip=null} = e.currentTarget.dataset;
    if (tag == "search" && title == "") {
      wx.showToast({
        title: '请填写搜索内容',
        icon:"none"
      })
      return;
    }
    if (tip != null) {
      let searchs = wx.getStorageSync('searchs') || [];
    let  ind =  searchs.findIndex((item)=>{
      return item ==  title;
    })
    // -1 代表没有 
    if(ind ==  -1){
      //没有,在前面插入
      searchs.unshift(title)
    }else{
      // 已经存在了
      searchs.splice(ind,1) //先从所在位置删除
      searchs.unshift(title)// 在数组最前面添加
    }
    wx.setStorageSync('searchs', searchs)
    }
   

// console.log(e);
    wx.navigateTo({
      url: `../recipelist/recipelist?id=${id}&title=${title}&tag=${tag}`,
    })

  },


})