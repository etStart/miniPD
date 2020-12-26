// pages/pbmenu/pbmenu.js
import global from "../..//utils/global"
import api from "../..//utils/api"
Page({

  data: {
    types: [], //当前所有可以选择的分类
    files: [], //图片列表[{url:"xxx"}]
  },
  onLoad(options) {
    this._getTypes();
  },
  // 获取所有分类
  async _getTypes() {
    let res = await api._findAll(global.table.typeTable)
    // console.log(res);
    this.setData({
      types: res.data
    })
  },
  //选择图片获取临时路径
  _selectImage(e) {
    console.log(e);
    //临时图片路径["xxx","xxx","xxx"]
    //人家要的：[{url:"xxx"},{url:"xxx"}]
    let tempFilePaths = e.detail.tempFilePaths;
    let files = tempFilePaths.map(item => {
      return {
        url: item
      }
    })
    //新老图片拼接
    files = this.data.files.concat(files);
    this.setData({
      files
    })
  },
  _delImage(e){
    console.log(e);
    let index = e.detail.index;
    this.data.files.splice(index,1);
    this.setData({
      files:this.data.files
    })
    
  },
 async _addRecipe(e){
console.log(e);
    let {recipeName,Typeid,recipeMakes} = e.detail.value
    if(recipeName == "" ||Typeid == ""||recipeMakes == ""||this.data.files.length <=0 ){
      wx.showToast({
        title: '请补全信息',
        icon:"none"
      })
      return; 
    }
    let follows = 0,views = 0,status=1,time = new Date().getTime();
    let filesID = await this._uploaderFiles(this.data.files);
    //执行操作
    let res = await api._add(global.table.recipeTable,{recipeName,Typeid,recipeMakes,follows : 0,views : 0,status:1,time : new Date().getTime(),filesID})
    // console.log(res);
    if (res._id) {
      wx.showToast({
        title: '添加成功',
      })
      setTimeout(() => {
        wx.navigateBack({
          delta: 1,
        })
      }, 1500);
    }
    
    
    // console.log(recipeName,Typeid,recipeMakes,filesID);
    
  },
  //封装多文件（图片）上传方法
  async _uploaderFiles(files){
    let filesID =[];
    files.forEach((item,index)=>{
      let extName = item.url.split(".").pop();
      // console.log(extName);
      let cloudPath = new Date().getTime()+"_"+index+"."+extName;
      console.log(cloudPath);
      let promise = wx.cloud.uploadFile({
        cloudPath: "web0622/"+cloudPath, // 上传至云端的路径
        filePath: item.url, // 小程序临时文件路径
      })
      filesID.push(promise)
    })
    filesID = await Promise.all(filesID)
    filesID = filesID.map((item)=>{
      return item.fileID
    })
  //  console.log(filesID);
    return filesID;
  }
})