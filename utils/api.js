// 封装数据库才做api
let db = wx.cloud.database()
const _add=(collectionName,data={})=>{
    return db.collection(collectionName).add({data})
}

const _findById=(collectionName,id="") => {
  // promise对象
  return db.collection(collectionName).doc(id).get()
}

const _findAll = async(collectionName,where={},orderBy={field:"_id",sort:"desc"})=>{
    const MAX_LIMIT = 20
      // 先取出集合记录总数
      const countResult = await db.collection(collectionName).count()
      const total = countResult.total
      // 计算需分几次取
      const batchTimes = Math.ceil(total / MAX_LIMIT)
      // 承载所有读操作的 promise 的数组
      const tasks = []
      for (let i = 0; i < batchTimes; i++) {
        const promise = db.collection(collectionName).where(where).skip(i * MAX_LIMIT).limit(MAX_LIMIT).orderBy(orderBy.field,orderBy.sort).get()
        tasks.push(promise)
      }
      //判断数据库是否存在数据
      if((await Promise.all(tasks)).length <= 0){
        return null;
      }
      // 等待所有
      return (await Promise.all(tasks)).reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data)
        }
      })
    }

//分页排序
const _find = (collectionName,where={},pages=1,limit=4,orderBy={field:"_id",sort:"desc"}) =>{
// limit每页显示多少条
let skip = (pages -1)*limit;
return db.collection(collectionName).where(where).skip(skip).limit(limit).orderBy(orderBy.field,orderBy.sort).get();
}

// 删除分类表
const _delById = (collectionName,id="") =>{
  return db.collection(collectionName).doc(id).remove()
}
//根据id进行修改
const _updateById = (collectionName,id="",data={})=>{
  return db.collection(collectionName).doc(id).update({
    data,
  })
}
//根据条件删除
const _delByWhere = (collectionName,where={})=>{
  return db.collection(collectionName).where(where).remove();
}
export default{
    _add,_findAll,_find,_findById,_delById,_updateById,db,_delByWhere
}