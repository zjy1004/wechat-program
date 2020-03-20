// pages/waybill-track/waybill-track.js
const { ajax } = require('../../utils/ajax.js')
const { ENUMS } = require('../../static/enums/enums.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    waybillId: '',
    center: {
      latitude: '',
      longitude: ''
    },
    markers: [],
    polyline: [{
      points: [],
      color: "#5A87E0",
      width: 3
    }],
    expectedArrivedTime: '',
    steps: []
  },
  markertap(e) {
    console.log(e.markerId)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      waybillId: options.waybillId
    })
    this.mapCtx = wx.createMapContext('map')
    this.initPointAndMarker(options.waybillId)
    this.queryStepsData(options.waybillId)
  },
  // 查询轨迹数据
  initPointAndMarker(waybillId) {
    var that = this;
    ajax('/waybill/api/waybillTrajectory/select/waybillTrajectory', 'postFromData', {waybillId}).then(res => {
      if (res.code === 200) {
        if (res.data && res.data.waybillTrajectoryList && res.data.waybillTrajectoryList.length) {
          let points = res.data.waybillTrajectoryList.map(item => {
            let obj = {
              latitude: item.latitude,
              longitude: item.longitude
            }
            return obj
          })
          this.includePointsFn(points)
          // points.push({
          //   latitude: '40.09',
          //   longitude: '116.25'
          // })
          // this.setData({
          //   'polyline[0].points': points,
          //   center: {
          //     latitude: points[points.length - 1].latitude,
          //     longitude: points[points.length - 1].longitude
          //   }
          // })
          this.setData({
            'polyline[0].points': points
          })
          this.drawMarker(res.data)
        } else {
          // 若后台无返回轨迹数据，获取当前位置信息
          wx.getLocation({
            success(res) {
              that.setData({
                center: {
                  latitude: res.latitude,
                  longitude: res.longitude
                }
              })
            }
          })
        }
      }
    })
  },
  queryStepsData(waybillId) {
    ajax('/waybill/api/waybillTrajectory/select/waybillTrajectory/info', 'postFromData', {waybillId}).then(res => {
      if (res.code === 200 && res.data) {
        let { expectedArrivedTime, waybillTransportInfoList} = res.data
        if (waybillTransportInfoList) {
          waybillTransportInfoList.forEach(item => {
            ENUMS.operateType.forEach(status => {
              if (status.id === item.operateType) {
                item.text = `${status.name}（${item.operateTime}）`
              }
            })
            item.desc = item.operate
          })
        }
        this.setData({
          expectedArrivedTime: expectedArrivedTime || '',
          steps: waybillTransportInfoList || []
        })
      }
    })
  },
  drawMarker: function (data) {
    let points = data.waybillTrajectoryList
    let len = points.length
    let startPos = {
      latitude: points[0].latitude,
      longitude: points[0].longitude
    }
    let endPos = {
      latitude: points[len - 1].latitude,
      longitude: points[len - 1].longitude
    }
    let carMarker = {
      id: 1,
      latitude: endPos.latitude,
      longitude: endPos.longitude,
      width: 40,
      height: 50,
      iconPath: '../../static/img/car-pos.png'
    }
    let startMarker = {
      id: 2,
      latitude: startPos.latitude,
      longitude: startPos.longitude,
      iconPath: '../../static/img/receive.png',
      width: 26,
      height: 26,
      label: {
        content: data.sendClientName,
        color: '#333333',
        borderWidth: 0,
        borderColor: '#aaaaaa',
        borderRadius: 5,
        padding: 4,
        fontSize: 14,
        bgColor: '#ffffff',
        anchorX: 10,
        anchorY: -26
      }
    }
    this.setData({
      markers: [carMarker, startMarker]
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  includePointsFn: function (points) {
    // 缩放视野展示所有经纬度(小程序API提供)
    this.mapCtx.includePoints({
      padding: [80, 50, 80, 50],
      points: [...points]
    })
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