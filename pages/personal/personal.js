// pages/personal/personal.js
import global from "../..//utils/global"
import api from "../..//utils/api"


Page({
  data: {
    isLogin: false, //未登录
    userInfo: {},
    activeIndex: "0",
    recipes:[],//用来存菜谱信息,
    allTypes:[],
    followsRecipes:[]
  },
  onShow() {

    //检测是否登录
    wx.checkSession({
      success: (res) => {
        let userInfo = wx.getStorageSync('userInfo') || {}
        // console.log(userInfo);

        this.setData({
          isLogin: true,
          userInfo
        })
      },
      fail: (error) => {
        this.setData({
          isLogin: false
        })
        wx.showToast({
          title: '请先登录',
          icon: "none"
        })
      }
    })
    this._getActiveIndexMsg()

  },
  _doLogin(e) {
    let _this = this
    // console.log(e);
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '登录才有意想不到的效果',
        icon: "none"
      })
      return;
    }
    wx.login({
      async success() {
        let userInfo = e.detail.userInfo;
        // console.log(userInfo, 4567689)
        //先去询问当前用户是否登录访问过
        //用openid去查询，去user表中查询
        wx.cloud.callFunction({
          name: "login",
          async success(r) {
            // console.log(r);
            let _openid = r.result.openid;
            // //获取用户信息
            let res = await api._findAll(global.table.userTable, {
              _openid
            }) || null;
            // // 判断是否存在，不存在，重新添加到数据库
            if (res == null || res.data.length <= 0) {
              //没有数据
              // 插到用户管理数据库
              let result = await api._add(global.table.userTable, {
                userInfo
              });
              if (!result._id) {
                // 登陆失败
                _this.setData({
                  isLogin: false
                })
                return;
              }
            }
            //登陆成功,设置缓存信息
            _this.setData({
              isLogin: true,
              userInfo
            })
            //将用户信息存入缓存
            wx.setStorageSync('userInfo', userInfo)
            wx.setStorageSync('openid', _openid)
            wx.showToast({

              title: '登陆成功',
              icon: "none"
            })
          }
        })

      },

    })
  },
  // 进入管理页面
  _toTypesPage() {
    let _openid = wx.getStorageSync("openid");
    if (global.adminOpenid != _openid) {
      return;
    }
    wx.navigateTo({
      url: "../pbmenutype/pbmenutype"
    })
  },
  //进入发布菜单页面
  _recipePage() {
    wx.navigateTo({
      url: '../pbmenu/pbmenu',
    })
  },
  // 选项卡
  _changeActiveIndex(e) {
    // console.log(e);
    let activeIndex = e.currentTarget.dataset.index
    // console.log(activeIndex);
    this.setData({
        activeIndex
      },function(){
        this._getActiveIndexMsg()
      })
  },
  // 获取选项卡下标
  _getActiveIndexMsg() {
    let activeIndex = this.data.activeIndex;
    // console.log(activeIndex);
    
    //最新数据，做一个分支判断
    switch (activeIndex) {
      case "0":
        this._getRecipeList()
        break;
      case "1":
        this._getTypeList()
        break;
      case "2":
        this._getFollowList()
        break;
    
    }
  },
 //删除菜谱
 _delRecipe(e){
  let {id,index} = e.currentTarget.dataset;
  let _this = this;
  wx.showModal({
    title:"删除提示",
    content:"您确定删除吗？",
    async success(res){
      if(res.confirm){
        let result = await api._updateById(global.table.recipeTable,id,{status:2})
        _this.data.recipes.splice(index,1)
        _this.setData({
          recipes:_this.data.recipes
        })
      }
    }
  })
},
  // 获取菜谱列表
 async _getRecipeList() {
    // console.log("菜谱");
    let _openid = wx.getStorageSync('openid')
    //一次性获取全部信息
    let res = await api._findAll(global.table.recipeTable,{_openid,status:1},{field:"time",sort:"desc"});
    // console.log(res);
    this.setData({
      recipes:res.data
    })
    
  },
  //获取分类列表
  async _getTypeList() {
    // console.log("分类");
    //获取全部菜谱
    let _openid = wx.getStorageSync('openid')
    let where ={
      _openid,
      status:1
    }
    let orderBy ={ 
      field : "time",
      sort: "desc"
    }
    let res = await api._findAll(global.table.recipeTable,where,orderBy)
    // console.log(res);
    let typeId = res.data.map((item)=>{
      return item.Typeid
    })
    // console.log(typeId);
    typeId = [...new Set(typeId)]
    // console.log(typeId);
    let allTypes = [];
    typeId.map((item)=>{
      let types = api._findById(global.table.typeTable,item)  
      allTypes.push(types)
    // console.log(types);
    
    })
    allTypes = await Promise.all(allTypes)
    // console.log(allTypes);
    this.setData({
      allTypes,
    })
    

  },
  //获取关注列表
  async _getFollowList() {
    // console.log("关注");
    let _openid = wx.getStorageSync('openid')
    let res = await api._findAll(global.table.followsTable,{_openid})
    console.log(res);
    let allRecipes = [];
    res.data.map((item)=>{
      let recipes = api._findById(global.table.recipeTable,item.recipeID)
      allRecipes.push(recipes)
    })
    allRecipes = await Promise.all(allRecipes)
    // console.log(allRecipes);
    this.setData({
      followsRecipes:allRecipes
    })
    
  },
  //跳转详情
  _torecipeDetailPage(e){
    let {id,title} = e.currentTarget.dataset;
    // console.log(id,title);
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&title=${title}`,
    })
  },
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
    wx.navigateTo({
      url: `../recipelist/recipelist?id=${id}&title=${title}&tag=${tag}`,
    })
  }
 
})