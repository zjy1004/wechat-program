//index.js
const { ajax } = require('../../utils/ajax.js') 
const { formatTime } = require('../../utils/util.js') 
import Notify from 'vant-weapp/notify/notify';
//获取应用实例
const app = getApp()

Page({
  data: {
    tabDisabled: true,
    hasMore: true,
    isLoading: false,
    authDialogShow: false,
    rejectAuthDialogShow: false,
    filterPopShow : false,
    tabIndex: 1,
    swiperData: [
      '../../static/img/swiper1.png'
      //   '../../static/img/swiper1.png',
      //   '../../static/img/swiper4.jpg',
      //   '../../static/img/swiper5.jpg'
    ],
    statusList: [
      { id: 11, label: '待装车' },
      { id: 1, label: '已装车' },
      { id: 2, label: '运输中' },
      { id: 3, label: '已签收' },
      { id: 4, label: '已拒收' },
      { id: 6, label: '已取消' }
    ],
    numberOrName: '',
    clientId: '', // 客户id
    flag: 2, // 1(发出)，2(收到)
    currentPage: 1,
    pageSize: 10,
    waybillStatusList: [], // 运单状态
    receiveWaybillData: [],
    sendWaybillData: [],
    searchValue: '',
    createTimeStart: '',
    createTimeEnd: '',
    dateEnd: '',
    currentDate: '',
    checkCode: ''
  },
  swiperToDownload() { // 轮播图跳转
    wx.navigateTo({
      url: `/pages/mine/downloadApp/downloadApp`
    })
  },
  handleTab(event) { // 切换收发Tab
    let index = event.currentTarget.dataset.index
    if (index == '1') { // 我收到的
      this.setData({
        tabIndex: '1',
        tabDisabled: true,
        searchValue: '',
        hasMore: true,
        isLoading: false,
        flag: 2,
        currentPage: 1
      }, function () {
        if (this.data.receiveWaybillData.length < 1 && app.globalData.haveUser) {
          this.getWaybill()
        }
      })
    } 
    if (index == '2') { // 我发出的
      this.setData({
        tabIndex: '2',
        tabDisabled: false,
        searchValue: '',
        hasMore: true,
        isLoading: false,
        flag: 1,
        currentPage: 1
      }, function () {
        if (this.data.sendWaybillData.length < 1 && app.globalData.haveUser) {
          this.getWaybill()
        }
      })
    }
  },
  searchWabill (e) { // 搜索运单
    this.setData({
      searchValue: e.detail
    }, function () {
      if (app.globalData.haveUser) {
        this.getWaybill()
      }
    })
  },
  searchValChange (e) {
    this.setData({
      searchValue: e.detail
    })
  },
  clearSearch (e) { // 清除搜索值
    this.setData({
      searchValue: e.currentTarget.dataset.clearval
    })
  },
  toggle(event) { // 运单状态复选框方法
    const { index } = event.currentTarget.dataset
    const checkbox = this.selectComponent(`.checkboxes-${index}`)
    checkbox.toggle()
  },
  onChange(event) { // 运单状态复选框方法
    this.setData({
      waybillStatusList: event.detail
    })
  },
  noop() { // 运单状态复选框方法
  },
  showFilterPop() { // 筛选弹框显示
    this.setData({
      filterPopShow: true,
      searchValue: '',
      currentPage: 1,
      hasMore: true,
      isLoading: false,
    })
  },
  filterPopClose() { // 筛选弹框关闭
    this.setData({
      filterPopShow: false
    })
    this.resetFilter()
  },
  resetFilter() { // 筛选重置
    this.setData({
      createTimeEnd: this.data.currentDate,
      createTimeStart: this.data.currentDate,
      waybillStatusList: []
    })
  },
  sureFilter() { // 筛选确定提交
    if (app.globalData.haveUser) {
      this.getWaybill().then(res => {
        if (res.code == 200) {
          this.setData({
            filterPopShow: false,
          })
          // this.resetFilter()
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 2000
          })
        }
      })
    }
  },
  startDateChange: function (e) { // 选择开单时间起
    this.setData({
      createTimeStart: e.detail.value
    })
  },
  endDateChange: function (e) { // 选择开单时间止
    this.setData({
      createTimeEnd: e.detail.value
    })
  },
  toWaybillDetail (e) { // 跳转运单详情
    const waybillId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/waybillDetail/waybillDetail?waybillId=${waybillId}`
    })
  },
  initTime () { // 获取当天日期
    let nowDate = formatTime(new Date()).substr(0, 10)
    this.setData({
      currentDate: nowDate,
      createTimeStart: nowDate,
      createTimeEnd: nowDate,
      dateEnd: nowDate
    })
  },
  callDriver (e) { // 拨打司机电话
    const phoneNumber = e.currentTarget.dataset.phonenumber
    wx.makePhoneCall({
      phoneNumber: phoneNumber,
      success(res) {
      }
    })
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 运单状态转换为文字
  waybillStatusChange (dataList) {
    return dataList = dataList.map(item => {
      switch (item.waybillStatus) {
        case 11:
          item.waybillStatus = '待发车';
          break;
        case 1:
          item.waybillStatus = '已装车';
          break;
        case 2:
          item.waybillStatus = '运输中';
          break;
        case 3:
          item.waybillStatus = '已签收';
          break;
        case 4:
          item.waybillStatus = '已拒收';
          break;
        case 6:
          item.waybillStatus = '已取消';
          break;
        default:
          break;
      }
      return item
    })
  },
  // 获取运单数据
  getWaybill () {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '加载中',
      })
      this.setData({
        isLoading: true
      })
      let params = {
        clientId: this.data.clientId,
        numberOrName: this.data.searchValue,
        flag: this.data.flag,
        waybillStatusList: this.data.waybillStatusList,
        createTimeStart: this.data.createTimeStart,
        createTimeEnd: this.data.createTimeEnd,
        currentPage: this.data.currentPage,
        pageSize: this.data.pageSize
      }
      ajax('/waybill/weChat/select/Waybill', 'post', params).then(res => {
        resolve(res)
        if (res.code === 200) {
          resolve(res)
          wx.hideLoading()
          this.setData({
            isLoading: false
          })
          let dataList = this.waybillStatusChange(res.data)
          if (this.data.flag == 2) { // 收到运单
            this.setData({
              receiveWaybillData: dataList
            })
          } else { // 发出运单
            this.setData({
              sendWaybillData: dataList
            })
          }
        } else {
          wx.hideLoading()
          this.setData({
            isLoading: false
          })
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 3000
          })
        }
      }).catch(err => {
        wx.hideLoading()
        this.setData({
          isLoading: false
        })
      })
    })
  },
  // 获取更多运单数据
  getMoreWaybill(flag) {
    return new Promise((resolve, reject) => {
      wx.showLoading({
        title: '加载中',
      })
      let params = {
        clientId: this.data.clientId,
        numberOrName: this.data.searchValue,
        flag: this.data.flag,
        waybillStatusList: this.data.waybillStatusList,
        createTimeStart: this.data.createTimeStart,
        createTimeEnd: this.data.createTimeEnd,
        currentPage: this.data.currentPage,
        pageSize: this.data.pageSize
      }
      ajax('/waybill/weChat/select/Waybill', 'post', params).then(res => {
        if (res.code === 200) {
          resolve(res)
          wx.hideLoading()
          if (this.data.flag == 2) { // 收到运单
            let receiverDataList = this.waybillStatusChange([...this.data.receiveWaybillData, ...res.data])
            this.setData({
              receiveWaybillData: receiverDataList
            })
          } else { // 发出运单
            let sendDataList = this.waybillStatusChange([...this.data.sendWaybillData, ...res.data])
            this.setData({
              sendWaybillData: sendDataList
            })
          }
        } else {
          wx.hideLoading()
          wx.showToast({
            title: res.message,
            icon: 'none',
            duration: 3000
          })
        }
      }).catch(err => {
        wx.hideLoading()
      })
    })
  },
  touchmove () {},
  onLoad: function () {
    app.callback = res => {
      if (res) {
        this.setData({
          haveClient: res,
          clientId: app.globalData.userData.pkReference
        }, function () {
          this.getWaybill()
        })
      }
    }
    // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) { // 已授权
    //       app.callback = res => {
    //         if (res) { // 已授权+已有用户获取数据
    //           this.setData({
    //             haveClient: res,
    //             clientId: app.globalData.userData.pkReference
    //           }, function () {
    //             wx.showTabBar()
    //             this.getWaybill()
    //           })
    //         } else { // 已授权+无用户提示绑定手机号
    //           this.setData({
    //             bindPhonePopShow: true
    //           })
    //         }
    //       }
    //       wx.getUserInfo({ // 获取微信个人信息
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           app.globalData.userInfo = res.userInfo
    //         }
    //       })
    //     } else { // 未授权提示授权弹框
    //       this.setData({
    //         authDialogShow: true
    //       })
    //     }
    //   }
    // })
  },
  onShow: function () {
    this.initTime()
    if (app.globalData.haveUser) {
      this.setData({
        clientId: app.globalData.userData.pkReference
      }, function () {
        this.getWaybill()
      })
    }
  },
  onReady: function () {
  },
  // 初次进入点击允许授权
  // getUserInfo: function (e) {
  //   if (e.detail.userInfo) { // 允许授权
  //     app.globalData.userInfo = e.detail.userInfo
  //     app.globalData.haveAuth = true
  //     if (app.globalData.haveUser) { // 授权后有用户直接获取运单信息
  //       this.setData({
  //         clientId: app.globalData.userData.pkReference
  //       }, function () {
  //         this.getWaybill()
  //       })
  //     }
  //   } else { // 取消授权显示弹框
  //     this.setData({
  //       rejectAuthDialogShow: true
  //     })
  //   }
  // },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (app.globalData.haveUser) {
      this.setData({
        currentPage: 1,
        isLoading: true,
        waybillStatusList: []
      }, function () {
        this.getWaybill().then(() => {
          this.setData({
            currentPage: 1,
            hasMore: true
          })
          wx.stopPullDownRefresh()
        })
      })
    } else {
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (app.globalData.haveUser) {
      if (this.data.hasMore) {
        this.setData({
          currentPage: this.data.currentPage + 1
        }, function () {
          this.getMoreWaybill().then(res => {
            if (res.data.length < 1) {
              this.setData({
                hasMore: false,
                currentPage: 1
              })
            }
          })
        })
      } 
    }
  },
})
