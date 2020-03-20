// pages/mine/mine.js
const { ajax } = require('../../utils/ajax.js');
import Notify from 'vant-weapp/notify/notify';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bindPhonePopShow: false, // 绑定手机号弹框是否显示
    haveClient: false, // 是否已绑定手机号
    phoneNumber: '', //手机号
    checkCode: '', // 验证码
    haveCheckCode: false,
    timeNum: 60,
    userInfo: {},
    clientId: '',
    listData: {},
    hasUserInfo: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },
  closePop () {
    this.setData({
      bindPhonePopShow: false
    })
  },
  touchmove() { },
  phoneNumChange(e) { // 电话输入框变化
    this.setData({
      phoneNumber: e.detail.value
    })
  },
  checkCodeChange(e) { // 验证码输入框变化
    this.setData({
      checkCode: e.detail.value
    })
  },
  bindPhoneShow () {
    this.setData({
      bindPhonePopShow: true
    })
  },
  getCheckCode() { // 获取验证码
    if (this.data.phoneNumber === '') {
      // wx.showToast({
      //   title: '手机号不能为空',
      //   icon: 'none',
      //   duration: 3000
      // })
      Notify({
        text: '手机号不能为空',
        duration: 2000,
        selector: '#custom-selector',
        backgroundColor: '#ee0a24'
      })
    } else {
      // 获取验证码
      ajax('/crm/auth/wx/sendCheckCode', 'post', { phoneNumber: this.data.phoneNumber }).then(res => {
        if (res.code === 200) {
          this.setData({
            haveCheckCode: true
          })
          wx.showToast({
            title: '验证码已发送',
            icon: 'success',
            duration: 3000
          })
          this.countdown()
        } else {
          Notify({
            text: res.message,
            duration: 2000,
            selector: '#custom-selector',
            backgroundColor: '#ee0a24'
          })
        }
      })
    }
  },
  countdown: function () { // 倒计时
    var that = this;
    var checkCodeCount = setInterval(function () {
      that.setData({
        timeNum: that.data.timeNum - 1
      })
      if (that.data.timeNum <= 0) {
        clearInterval(checkCodeCount);
        //取消指定的setInterval函数将要执行的代码 
        that.setData({
          timeNum: 60,
          haveCheckCode: false
        })
      }
    }, 1000)
  },
  // 确认绑定手机号
  bingPhoneSure() {
    if (this.data.phoneNumber === '') {
      // wx.showToast({
      //   title: '手机号不能为空',
      //   icon: 'none',
      //   duration: 3000
      // })
      Notify({
        text: '手机号不能为空',
        duration: 2000,
        selector: '#custom-selector',
        backgroundColor: '#ee0a24'
      })
    } else {
      if (this.data.checkCode === '') {
        Notify({
          text: '验证码不能为空',
          duration: 2000,
          selector: '#custom-selector',
          backgroundColor: '#ee0a24'
        })
      } else {
        wx.login({
          success: res => {
            let code = res.code;
            let params = {
              resCode: code,
              checkCode: this.data.checkCode,
              phoneNumber: this.data.phoneNumber
            }
            ajax('/crm/auth/wx/login', 'post', params).then(res => {
              if (res.code === 200) { // 有该用户获取数据
                wx.setStorageSync("token", res.data.token)
                app.globalData.userData = res.data
                app.globalData.haveUser = true
                this.setData({
                  bindPhonePopShow: false,
                  haveClient: false
                },function () {
                  wx.switchTab({
                    url: '/pages/index/index'
                  })
                })
              } else { // 无该用户继续绑定
                Notify({
                  text: res.message,
                  duration: 2000,
                  selector: '#custom-selector',
                  backgroundColor: '#ee0a24'
                })
              }
            })
          },
          fail: err => {
            reject(err)
          }
        })
      }
    }
  },
  // 未授权——>登录授权
  getUserInfo: function (e) {
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    }
  },
  queryWaybillTotal() {
    wx.showLoading({
      title: '加载中',
    })
    ajax('/waybill/weChat/select/waybillTotal', 'post', { clientId: this.data.clientId.toString()}).then(res => {
      if (res.code === 200) {
        wx.hideLoading()
        this.setData({
          listData: res.data
        })
      } else {
        wx.hideLoading()
      }
    })
  },

  init () {
    // if (app.globalData.userInfo) { // 授权后的全局个人信息
    //   this.setData({
    //     userInfo: app.globalData.userInfo,
    //     hasUserInfo: true
    //   })
    // }
    if (app.globalData.userData) {
      this.setData({
        clientId: app.globalData.userData.pkReference
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) { // 已授权
          wx.getUserInfo({ // 获取微信个人信息
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              app.globalData.userInfo = res.userInfo
              this.setData({
                userInfo: res.userInfo,
                hasUserInfo: true
              })
            }
          })
        } else { // 未授权
          this.setData({
            hasUserInfo: false
          })
        }
      }
    })
    // 是否已绑定手机号
    if (app.globalData.haveUser) {
      this.setData({
        haveClient: false
      })
    } else {
      this.setData({
        haveClient: true
      })
    }
    this.init()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.init()
    if (app.globalData.haveUser) {
      this.queryWaybillTotal()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})