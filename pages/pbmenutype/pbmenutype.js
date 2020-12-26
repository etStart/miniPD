// pages/pbmenutype/pbmenutype.js
import global from "../..//utils/global"
import api from "../..//utils/api"
Page({
  data: {
    // 添加分类的名称
    addVal:"",
    types:[],//所有分类
    updVal:""//修改内容
  },
  onLoad(){
    this._getTypes();
  },
  // 分类添加
  async _typeAdd(){
    let addVal = this.data.addVal;
    let types = this.data.types;
    let ind = types.findIndex((item)=>{
      return item.typeName == addVal;
    })
    if (ind != -1) {
      wx.showToast({
        title: '当前类别已经存在',
        icon:"none"
      })
      return;
    }

    // console.log(123);
    // 执行添加
    let res = await api._add(global.table.typeTable,{typeName:addVal})
    // console.log(res);
    if (res._id) {
      wx.showToast({
        title: '添加成功',
        // icon:"none"
      })
      this.setData({
        addVal:""
      })
      this._getTypes();
    }else{
      wx.showToast({
        title: '添加失败',
        icon:"none"
      })
    }

  },
  // 获取所有的菜谱分类信息
  async _getTypes(){
    let res = await api._findAll(global.table.typeTable)
    // console.log(res);
      this.setData({
        types:res.data
      })
  },
  //删除
 async _delType(e){
    let {id,index} = e.currentTarget.dataset;
    // console.log(id);
    let res = await api._delById(global.table.typeTable,id);
    // console.log(res);
    if (res.stats.removed == 1) {
      wx.showToast({
        title: '删除成功',
      })
      //根据索引，在types将此元素删除
      this.data.types.splice(index,1)
      this.setData({
        types:this.data.types
      })
    }
    
  },
//修改
_editPage(e){
  let {index} = e.currentTarget.dataset;
  this.setData({
    updVal:this.data.types[index].typeName,
    _id:this.data.types[index]._id

  }) 
},
// 按钮修改变值
async _doUpdate(){
  let typeName = this.data.updVal;
  let _id = this.data._id;
  let res = await api._updateById(global.table.typeTable,_id,{typeName})
  if (res.stats.updated) {
    this._getTypes()
    this.setData({
      updVal:""
    })
   
  }
}
  
})