//app.js
const { ajax } = require('./utils/ajax.js') 
App({
  onLaunch: function () { // 小程序初始化完成时（全局只触发一次）
    // wx.hideTabBar()
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // Promise.all([this.wxGetSetting(), this.wxLogin()]).then(results => {
    //   if (this.callback) {
    //     this.callback(results)
    //   }
    // }).catch(err => {
    //   // throw err
    // })
    this.wxLogin().then(result => {
      if(this.callback) {
        this.callback(result)
      }
    }).catch(err => {
    })
  },
  wxLogin: function () {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          let code = res.code;
          ajax('/crm/auth/wx/grant/login', 'post', { resCode: code }).then(res => {
            if (res.code === 200) { // 有该用户
              this.globalData.haveUser = true
              this.globalData.userData = res.data
              wx.setStorageSync("token", res.data.token)
            } else { // 无用户
              this.globalData.haveUser = false
            }
            resolve(this.globalData.haveUser)
          }).catch(err =>{
            reject(err)
          })
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },
  // wxGetSetting: function () {
  //   return new Promise((resolve, reject) => {
  //     // 获取用户信息
  //     wx.getSetting({
  //       success: res => {
  //         if (res.authSetting['scope.userInfo']) { // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
  //           this.globalData.haveAuth = true
  //           wx.getUserInfo({
  //             success: res => {
  //               // 可以将 res 发送给后台解码出 unionId
  //               this.globalData.userInfo = res.userInfo
  //               // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
  //               // 所以此处加入 callback 以防止这种情况
  //               if (this.userInfoReadyCallback) {
  //                 this.userInfoReadyCallback(res)
  //               }
  //             }
  //           })
  //         } else { // 未授权
  //           this.globalData.haveAuth = false
  //         }
  //         resolve(this.globalData.haveAuth)
  //       },
  //       fail: err => {
  //         reject(err)
  //       }
  //     })
  //   })
  // },
  onShow: function () { // 小程序启动，或从后台进入前台显示时
    
  },
  onHide: function () { // 小程序从前台进入后台时

  },
  onError: function () { // 小程序发生脚本错误，或者 api 调用失败时触发，会带上错误信息

  },
  onPageNotFound: function (res) { // 小程序要打开的页面不存在时触发，会带上页面信息回调该函数
    // wx.redirectTo({
    //   url: 'pages/...'
    // }) // 如果是 tabbar 页面，请使用 wx.switchTab
  },
  globalData: {
    userInfo: '',
    haveUser: false
  }
})