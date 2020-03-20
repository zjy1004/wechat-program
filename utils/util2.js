//封装fetch,返回GET请求方法
const baseUrl = '';

const fetch = {
  http(url, method, data) {
    //返回一个new Promise对象
    return new Promise((resolve, reject) => {

      let token = wx.getStorageSync('token')
      let header = {
        'content-type': 'application/json'
      }
      if(token) {
        //??????
        header.token = token
      }
      debugger
      wx.request({
        url: baseUrl + url,
        data,
        method,
        header,
        success: function(res) {
          // console.log(res.header.Token)
          resolve(res.data)
          if (res.header.Token || res.header.token){
            wx.setStorageSync('token', res.header.Token || res.header.token)
          }
        },
        fail: function(err) {
          reject(err)
        }
      })
    })
  },
  get(url, data) {
    return this.http(url, 'GET', data)
  },
  post(url, data) {
    return this.http(url, 'POST', data)
  },
  delete(url, data) {
    return this.http(url, 'DELETE', data)
  }
}

exports.fetch = fetch;
