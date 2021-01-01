import global from "../../utils/global"
import api from "../../utils/api"

Page({
  data: {
    hotRecipes: [], //热门菜谱
    types: [], //首页分类中展示
    searchVal: "" //搜索条件
  },
  onLoad() {

  },
  onShow() {
    this._getHotRecipes(),
      this._getTypes()
  },
  async _getHotRecipes() {
    //根据views做desc排序where ={status:1}
    let res = await api._find(global.table.recipeTable, {
      status: 1
    }, 1, 4, {
      field: "views",
      sort: "desc"
    })
    // console.log(res);
    let userAllPromise = []; //所有用户信息
    res.data.map(item => {
      let userPromise = api._findAll(global.table.userTable, {
        _openid: item._openid
      })
      userAllPromise.push(userPromise)
    })
    userAllPromise = await Promise.all(userAllPromise)
    // console.log(userAllPromise);
    res.data.map((item, index) => {
      item.userInfo = userAllPromise[index].data[0].userInfo
    })
    this.setData({
      hotRecipes: res.data
    })
  },
  async _getTypes() {
    let res = await api._find(global.table.typeTable, {}, 1);
    // console.log(res);
    this.setData({
      types: res.data
    })

  },
  _typelistPage() {
    wx.navigateTo({
      url: '../typelist/typelist',
    })
  },
  //点击普通分类进入菜谱列表页面
  _recipelistPage(e) {
    // console.log(e);
    let {
      id = null, title, tag
    } = e.currentTarget.dataset;
    if (tag == "search" && title == "") {
      wx.showToast({
        title: '请填写搜索内容',
        icon: "none"
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

  },
  //跳转详情
  _torecipeDetailPage(e) {
    let {
      id,
      title
    } = e.currentTarget.dataset;
    // console.log(id,title);
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&title=${title}`,
    })
  }
})