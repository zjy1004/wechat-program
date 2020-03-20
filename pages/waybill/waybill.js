// pages/waybill/waybill.js
const { ajax } = require('../../utils/ajax.js')
Page({
  data: {
    listData: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // onShow: function () {
  //   this.queryList()
  // },
  onLoad: function (options) {
    this.queryList()
  },
  queryList () {
    ajax('/waybill/api/waybillApp/queryDriverWaitDeliverWaybill', 'get').then(res => {
      if (res.code === 200) {
        this.setData({
          listData: res.data
        })
      }
    })
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