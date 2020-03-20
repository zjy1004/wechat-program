module.exports = {
  bindData(e) {
    let name = e.currentTarget.dataset.name;
    let nameMap = {}
    if (name.indexOf('.') !== -1) { // 绑定的是对象属性
      let nameList = name.split('.')
      if (this.data[nameList[0]]) {
        nameMap[nameList[0]] = this.data[nameList[0]]
      } else {
        nameMap[nameList[0]] = {}
      }
      nameMap[nameList[0]][nameList[1]] = e.detail.value
    } else {// 绑定的是单层属性
      nameMap[name] = e.detail.value ? e.detail.value : e.detail || ''
    }
    this.setData(nameMap)
  }
}