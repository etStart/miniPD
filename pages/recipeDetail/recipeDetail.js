const {
  default: api
} = require("../../utils/api");
const {
  default: global
} = require("../../utils/global");
let _ = api.db.command;

// pages/recipeDetail/recipeDetail.js
Page({
  data: {
    info: {},
    isFollows: false,
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: options.title,
    })
    this.data.id = options.id;
    this._getRecipeDetail()
  },
  async _getRecipeDetail() {
    let id = this.data.id;
    let res = await api._findById(global.table.recipeTable, id);
    //用户id
    let user = await api._findAll(global.table.userTable, {
      _openid: res.data._openid
    })

    res.data.userInfo = user.data[0].userInfo;
    api._updateById(global.table.recipeTable, id, {
      views: _.inc(1) //自增
    })
    res.data.views++;
    this.setData({
      info: res.data
    })

    let openid = wx.getStorageSync('openid') || null;
    if (openid == null  ) {
      this.setData({
        isFollows: false,
      })
    } else {
      // 如果登录，那么判断一下是否关注了
      let result = await api._findAll(global.table.followsTable, {
        _openid: openid,
        recipeID: id
      })
      // console.log(result);

      console.log(result,"查询是否关注");
      if (result == null || result.data.length<=0) {
        this.setData({
          isFollows: false
        })
      } else {
        this.setData({
          isFollows: true
        })

      }
    }

  },
  //执行关注
  async _doFollow() {
    // 关注表_id _openid recipeID 
    let _this = this;
    let openid = wx.getStorageSync('openid') || null;
    if (!openid) {
      wx.showToast({
        title: '请先登录',
        icon: "icon"
      })
      return;
    }
    if (_this.data.isFollows) {
      //取消关注
      wx.showModal({
        title: "提示",
        content: "您确定要取消吗？",
        async success(res) {
          // console.log(res);
          if (res.confirm) {
            // 条件
            let where = {
              _openid: openid,
              recipeID: _this.data.id
            }
            let results = await api._delByWhere(global.table.followsTable, where);
            // console.log(results);
            if (results.stats.removed == 1) {
              _this.data.info.follows--;
              _this.setData({
                isFollows: false,
                info: _this.data.info
              })
              api._updateById(global.table.recipeTable, _this.data.id, {
                // views: res.data.views +1
                follows: _.inc(-1) //自增  可正可负
              })
            }
          }
        }
      })

    } else {
      //执行添加
      let res = await api._add(global.table.followsTable, {
        recipeID: this.data.id
      })
      console.log(res);
      if (res._id) {
        this.data.info.follows++;
        this.setData({
          isFollows: true,
          info: this.data.info
        })
        wx.showToast({
          title: '关注成功',
        })
        api._updateById(global.table.recipeTable, this.data.id, {
          follows: _.inc(1) //自增
        })
      } 
    }
  }

})