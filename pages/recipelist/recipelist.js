import global from "../../utils/global"
import api from "../../utils/api"
Page({

  data: {
    recipes:[],
    page:1,
    limit:5,
    tips:false,
    tip:false,
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.title
    })
    this.data.id = options.id;
    this.data.tag = options.tag;
    this.data.title = options.title;
    this._getRecipes()
  },
  //获取菜谱信息
  async _getRecipes(){
    let {tag,page,limit,title} = this.data;
    let orderBy={}
    let where ={}
    switch (tag) {
      case "ptfl":
        let id = this.data.id;
        // console.log(id);
        where = {
          Typeid:id,
          status:1
        }
        orderBy={
          field:"time",
          sort:"desc"
        }
        break;
      case "rmcp":
          where = {
            status:1
          }
          orderBy={
            field:"views",
            sort:"desc"
          }
        break;
        case "tjcp":
          //推荐菜谱进入
          where = {
            status:1
          }
          orderBy={
            field:"follows",
            sort:"desc"
          }
          break;
        case "search":
          //模糊搜索进入
          where={
            recipeName:api.db.RegExp({
              regexp:title,
              options:'i',
            })
          }
          orderBy={
            field:"time",
            sort:"desc"
          }
          break;
    }
    // console.log(where,orderBy);
    
    // let page = this.data.page;
    // let limit = this.data.limit;
    let res = await api._find(global.table.recipeTable,where,page,limit,orderBy);
    //判断当前res，data是否有值，有值继续向下执行，没有值，return;
    if(res.data.length<=0 && page == 1){
      // 如果是第一页，并且数据为空，则直接返回
      this.setData({
        tips:true
      })
      return;
    }
    if(res.data.length <limit){
      this.setData({
        tip:true
      })
    }
    // 处理用户信息
    let userAllPromise = [];//所有用户信息
      res.data.map(item=>{
        let userPromise = api._findAll(global.table.userTable,{_openid:item._openid})
        userAllPromise.push(userPromise)
      })
      userAllPromise = await Promise.all(userAllPromise)
      // console.log(userAllPromise);
      res.data.map((item,index)=>{
        item.userInfo = userAllPromise[index].data[0].userInfo
      })  
      // console.log(res.data);
      res.data = this.data.recipes.concat(res.data)
    this.setData({
      recipes:res.data
    })
    
  },
  // 上拉触底事件
  onReachBottom(){
    // console.log(123);
    this.data.page++;
    this._getRecipes()
    
  },
  //跳转详情
  _torecipeDetailPage(e){
    let {id,title} = e.currentTarget.dataset;
    // console.log(id,title);
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${id}&title=${title}`,
    })
  }

  
})