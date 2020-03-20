// pages/mine/myInfo/myInfo.js
const { ajax } = require('../../../utils/ajax.js') 
import Notify from 'vant-weapp/notify/notify';
import Dialog from 'vant-weapp/dialog/dialog';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    userData: {},
    bingPhoneInfo: {
      phoneNumber: '',
      checkCode: '',
      clientId:''
    },
    listData: [],
    role: '选择',
    roleParmas: '1',
    show: false,
    changeFlag: true,
    bindTellShow: false,
    timeShow: true,
    countDownNum: '60'
  },
  bindNum(event) {
    this.setData({
      'bingPhoneInfo.phoneNumber': event.detail.value
    })
  },
  bindCheckCode(event) {
    this.setData({
      'bingPhoneInfo.checkCode': event.detail.value
    })
  },
  bindTellNum (event) {
    this.setData({
      'bingPhoneInfo.clientId': this.data.userData.pkReference
    })
    let params = this.data.bingPhoneInfo
    console.log(this.data.bingPhoneInfo)
    this.selectComponent('#tellDialog').stopLoading()
    if (this.data.bingPhoneInfo.phoneNumber === '' || this.data.bingPhoneInfo.checkCode === '') {
      wx.showToast({
        title: '请输入手机号和验证码',
        icon: 'none',
        duration: 2000
      })
      return
    }
    ajax('/crm/weChatUser/update/bindingPhone', 'post', params ).then(res => {
      if (res.code === 200) {
        this.setData({ bindTellShow: false })
        this.queryPhoneNumberList()
        wx.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 2000
        })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  cancelBindTell () {
    this.setData({ bindTellShow: false })
  },
  bindTell (e) {  
    this.setData({ bindTellShow: !this.data.bindTellShow})
  },
  getVerificationCode (e) {
    let params = {
      phoneNumber: this.data.bingPhoneInfo.phoneNumber
    }
    ajax('/crm/auth/wx/sendCheckCode', 'post', params).then(res => {
      if (res.code === 200) {
        this.getCountDown()
        this.setData({ timeShow: false })
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  btnclick (e) {
    console.log(e.currentTarget.dataset.id)
    if(e.currentTarget.dataset.id === 1) {
      this.setData({ roleParmas: '1'})
    } else if (e.currentTarget.dataset.id === 2) {
      this.setData({ roleParmas: '2'})
    }
    this.setData({changeFlag: !this.data.changeFlag})
  },
  selectRole(event) {
    // if (this.data.roleParmas === '1') {
    //   this.setData({role: '经销商'})
    // } else if(this.data.roleParmas === '2') {
    //   this.setData({role: '修理厂'})
    // }
    let parpams = {
      clientId: this.data.userData.pkReference.toString(),
      clientType: this.data.roleParmas
    }
    ajax('/crm/weChatUser/update/clientType', 'post', parpams).then(res => {
      if (res.code === 200) {
        wx.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        })
        this.queryRole()
      }
    })
  },

  onClose() {
    this.setData({ close: false });
  },
  changeRole () { // 选择角色
    this.setData({show: true})
  },

  queryRole () {
    ajax('/crm/weChatUser/select/clientType', 'post', { clientId: this.data.userData.pkReference.toString() }).then(res => {
      if (res.code === 200) {
        if (res.data === 1) {
          this.setData({ role: '经销商', changeFlag: true})
        }
        if (res.data === 2) {
          this.setData({ role: '修理厂', changeFlag: false })
        }
      }
    })
  },
  getCountDown() { // 倒计时
    let that = this
    let count_num = 59
    let countDownNum = that.data.countDownNum
    let myTime = setInterval(()=>{
      that.setData({
        countDownNum: count_num--
      })
      if (count_num ===0) {
        that.setData({
          countDownNum: '60'
        })
        clearInterval(myTime)
        this.setData({ timeShow: true })
      }
    },1000)

  },

  queryPhoneNumberList() {
    ajax('/crm/weChatUser/select/phoneNumberList', 'post', { clientId: this.data.userData.pkReference.toString() }).then(res => {
      if (res.code === 200) {
        this.setData({
          listData: res.data
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) { // 授权后的全局个人信息
      this.setData({
        userInfo: app.globalData.userInfo,
      })
    }
    if (app.globalData.userData) {
      this.setData({
        userData: app.globalData.userData
      })
    }
    if (app.globalData.haveUser) {
      this.queryPhoneNumberList()
      this.queryRole()
    }
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