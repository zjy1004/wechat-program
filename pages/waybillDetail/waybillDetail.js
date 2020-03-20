// pages/waybillDetail/waybillDetail.js
var app = getApp();
const { ajax } = require('../../utils/ajax.js') 
const { ENUMS } = require('../../static/enums/enums.js')
import Notify from 'vant-weapp/notify/notify';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    waybillId: '',
    waybillDetail: {},
    userData: {},
    waybillInfo: {
      status: '',
      info: ''
    }
  },

  goMap () {
    console.log(this.data.waybillId.waybillId,"123")
    wx.navigateTo({
      url: `/pages/waybill-track/waybill-track?waybillId=${this.data.waybillId.waybillId}`,
    })
  },

  tell (e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.id,
      success (res) {
        console.log(res)
      }
    })
  },

  queryDetail () {
    ajax('/waybill/weChat/select/waybillDetails', 'post',  this.data.waybillId ).then(res => {
      if (res.code === 200) {
        this.setData({
          waybillDetail: res.data
        })
        if (res.data.freightPayer ===1) {
          this.setData({
            'waybillDetail.freightPayer': '发货方'
          })
        }
        if (res.data.freightPayer ===2) {
          this.setData({
          'waybillDetail.freightPayer': '收货方'
          })
        }
        if (res.data.waybillStatus ===1) {
          this.setData({
          'waybillDetail.waybillStatusName': '待发车'
          })
        }
        if (res.data.waybillStatus ===2) {
          this.setData({
            'waybillDetail.waybillStatusName': '运输中'
          })
        }
        if (res.data.waybillStatus ===3) {
          this.setData({
            'waybillDetail.waybillStatusName': '已签收'
          })
        }
        if (res.data.waybillStatus ===4) {
          this.setData({
            'waybillDetail.waybillStatusName': '已拒签'
          })
        }
        if (res.data.waybillStatus ===5) {
          this.setData({
            'waybillDetail.waybillStatusName': '已完成'
          })
        }
        if (res.data.waybillStatus ===6) {
          this.setData({
            'waybillDetail.waybillStatusName': '已取消'
          })
        }
        if (res.data.waybillStatus ===7) {
          this.setData({
            'waybillDetail.waybillStatusName': '已收款'
          })
        }
        if (res.data.waybillStatus ===8) {
          this.setData({
            'waybillDetail.waybillStatusName': '已交款'
          })
        }
        if (res.data.waybillStatus ===9) {
          this.setData({
            'waybillDetail.waybillStatusName': '待入库'
          })
        }
        if (res.data.waybillStatus ===10) {
          this.setData({
            'waybillDetail.waybillStatusName': '待退货'
          })
        }
        if (res.data.waybillStatus ===11) {
          this.setData({
            'waybillDetail.waybillStatusName': '待装车'
          })
        }
        this.queryStepsData(res.data.waybillId)
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

  queryStepsData(waybillId) {
    ajax('/waybill/api/waybillTrajectory/select/waybillTrajectory/info', 'postFromData', { waybillId }).then(res => {
      if (res.code === 200 && res.data) {
        let operateType = res.data.waybillTransportInfoList?res.data.waybillTransportInfoList[0].operateType:''
        let operateTime = res.data.waybillTransportInfoList?res.data.waybillTransportInfoList[0].operateTime:''
        let operate = res.data.waybillTransportInfoList?res.data.waybillTransportInfoList[0].operate:''
          ENUMS.operateType.forEach(status => {
            if (status.id === operateType) {
              this.setData({
                'waybillInfo.status': `${status.name}（${operateTime}）`,
                'waybillInfo.info': `${operate}`,
              })
            }
          })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      waybillId: options
    })
    if (app.globalData.userData) {
      this.setData({
        userData: app.globalData.userData
      })
    }
    this.queryDetail()
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