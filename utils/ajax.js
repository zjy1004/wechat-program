// const baseUrl = 'http://logistics.b2bex.com'
const baseUrl = 'https://wl.autozi.com'
// const baseUrl = 'http://172.16.2.198:8085'
// const baseUrl = 'http://172.16.1.111:8085'
// const baseUrl = 'http://172.16.1.125:8085'


const ajax = (url = '', method = 'get', params = {}) => {
  return new Promise((resolve, reject) => {
    let token = wx.getStorageSync('token')
    let header = {
      'content-type': method != 'postFromData' ? 'application/json' : 'application/x-www-form-urlencoded'
    }
    if (token) {
      header.token = token
    }
    wx.request({
      url: `${baseUrl}${url}`,
      method: method === 'postFromData' ? 'post' : method,
      data: params,
      header,
      // header: {
      //   'token': url === '/crm/auth/login' ? '' : wx.getStorageSync('token'),
      //   'content-type': method !=  'postFromData' ? 'application/json' : 'application/x-www-form-urlencoded'
      // },
      success (res) {
        resolve(res.data)
        if (res.statusCode == 500) {
          wx.showToast({
            title: '服务器内部错误',
            icon: 'none',
            duration: 3000
          })
        }
        if (res.statusCode == 404) {
          wx.showToast({
            title: '网络异常',
            icon: 'none',
            duration: 3000
          })
        }
      },
      fail (error) {
          wx.showToast({
            title: '网络异常',
            icon: 'none',
            duration: 3000
          })
        reject(error)
      },
      complete () {
        
      }
    })
  })
}
module.exports = {
  ajax
}
