import request from '../../utils/request'
import PubSub from 'pubsub-js'

Page({
  data: {
    day: '', // 天
    month: '', // 月
    recommendList: [], // 推荐列表数据
    index: 0, // 点击音乐的下标
  },

  onLoad: function (options) {
    // 判断用户是否登录
    let userInfo = wx.getStorageSync('userInfo');
    if(!userInfo){
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          // 跳转至登录界面
          wx.reLaunch({
            url: '/pages/login/login'
          })
        }
      })
    }

    // 更新日期的状态数据
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1 //注意
    })
    
    // 获取每日推荐的数据
    this.getRecommendList()
    // 订阅来自songDetail页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      let {recommendList, index} = this.data;
      if(type === 'pre'){ // 上一首
        (index === 0) && (index = recommendList.length);
        index -= 1;
      }
      else { // 下一首
        (index === recommendList.length - 1) && (index = -1);
        index += 1;
      }
      // 更新下标
      this.setData({
        index
      })
      let musicId = recommendList[index].id;
      // 将musicId回传给songDetail页面
      PubSub.publish('musicId', musicId)
    });
  },
  
  // 获取用户每日推荐数据
  async getRecommendList(){
    let recommendListData = await request('/recommend/songs');
    this.setData({
      recommendList: recommendListData.recommend
    })
  },
  
  // 跳转至songDetail页面
  toSongDetail(event){
    let {song, index} = event.currentTarget.dataset; //通过data-自定义属性获取
    this.setData({
      index
    })
    // 路由跳转传参： query参数
    wx.navigateTo({
      // 不能直接将song对象作为参数传递，长度过长，会被自动截取掉
      // url: '/pages/songDetail/songDetail?songPackage=' + JSON.stringify(songPackage)
      url: '/pages/songDetail/songDetail?musicId=' + song.id
    })
  },
})