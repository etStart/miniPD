// pages/typelist/typelist.js
import global from "../../utils/global"
import api from "../../utils/api"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types:[]//获取所有分类信息
  },
  onLoad(options){
    this._getAllTypes()
  },

  onShow(){

  },
  async _getAllTypes(){
    let res = await api._findAll(global.table.typeTable)
    // console.log(res);
    this.setData({
      types : res.data
    })
    
  },
  _recipelistPage(e){
    // console.log(e);
    let {id=null,title,tag} = e.currentTarget.dataset;
    if (tag == "search" && title == "") {
      wx.showToast({
        title: '请填写搜索内容',
        icon:"none"
      })
      return;
      
    }
    if (tag == "searchs") {
      let searchs = wx.getStorageSync('searchs') || [];
      let ind = searchs.findIndex((item) => {
        return item == title;
      })
      // -1 代表没有 
      if (ind == -1) {
        //没有,在前面插入
        searchs.unshift(title)
      } else {
        // 已经存在了
        searchs.splice(ind, 1) //先从所在位置删除
        searchs.unshift(title) // 在数组最前面添加
      }
      wx.setStorageSync('searchs', searchs)
    }
// console.log(e);
    wx.navigateTo({
      url: `../recipelist/recipelist?id=${id}&title=${title}&tag=${tag}`,
    })

  }

})