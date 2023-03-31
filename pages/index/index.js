// @ts-nocheck
import { getcolor, restoreData } from "@utils/index"

const { G } = getApp()
const window_w = wx.getSystemInfoSync().windowWidth * 0.9

Page({
  data: {
    pxLine: window_w,
    gird: 16,
    single_h: 20,
    scale: 1,
    can_move: false,
    x: 0,
    y: 0,
    slider: 0,
    animation: false,
    dyadic_arr: [],
    active_btn: "edit",
    pen_color: "#000",
    palette: ["#000", "#0000cc", "#00ffff", "#ff00ff", "#66ff99"],
    history: [],
    h_pointer: 0,
    can_eyes: false,
    visible: false,
    visible_save: false,
  },
  onReady() {
    this.setSingle_H()
  },
  buildArr() {
    let arr = Array.from({ length: this.data.gird }).map(() =>
      Array.from({ length: this.data.gird }).fill("#fff")
    )
    let temp = []
    temp.push(JSON.parse(JSON.stringify(arr)))
    this.setData({
      dyadic_arr: arr,
      history: temp,
    })
    this.data.h_pointer = temp.length - 1
  },
  onVisibleChange() {
    this.setData({
      visible: false,
    })
  },
  onVisibleChange2() {
    this.setData({
      visible_save: false,
    })
  },
  handleAction() {
    this.setData({
      visible: true,
    })
  },
  handleScaleChange(e) {
    this.setData({
      scale: 1 + e.detail.value * 0.01,
      slider: e.detail.value,
    })
  },
  handleSelected(e) {
    let gird = e.currentTarget.dataset.set
    console.log(gird)
    this.setData({
      gird: parseInt(gird),
    })
    this.setSingle_H()
    this.setData({
      visible: false,
    })
  },
  handleSelected2(e) {
    let set = e.currentTarget.dataset.set
    if (set == "save") {
      // 保存到相册
      this.exportToAlbum()
    }
    this.setData({
      visible_save: false,
    })
  },
  exportToAlbum() {
    let that = this
    let gird = this.data.gird
    wx.showModal({
      title: "提示",
      content: `是否导出 ${gird}x${gird} 图片`,
      success(res) {
        if (res.confirm) {
          let tempArr = JSON.parse(JSON.stringify(that.data.dyadic_arr))
          tempArr.map((k) => {
            k.map((value, index) => {
              k[index] = getcolor(value)
            })
          })
          tempArr = restoreData(tempArr)
          const canvas = wx.createOffscreenCanvas({
            type: "2d",
            width: gird,
            height: gird,
          })
          const ctx = canvas.getContext("2d")
          let imgdata = ctx.createImageData(gird, gird)
          imgdata.data.set(tempArr)
          ctx.putImageData(imgdata, 0, 0, 0, 0, gird, gird)
          const b64Data = ctx.canvas.toDataURL()

          const time = new Date().getTime()
          let files = wx.getStorageSync("files") || []
          files.push(time)
          wx.setStorageSync("files", files)
          const filePath = `${wx.env.USER_DATA_PATH}/temp_image_${time}.png`
          const buffer = wx.base64ToArrayBuffer(
            b64Data.substring(b64Data.indexOf(",") + 1)
          )
          wx.getFileSystemManager().writeFile({
            filePath: filePath,
            data: buffer,
            encoding: "utf8",
            success: (res) => {
              wx.previewImage({
                current: filePath,
                urls: [filePath],
                success(res) {},
                fail(err) {
                  console.log(err)
                },
              })
            },
            fail: (err) => {
              console.log(err)
            },
          })
        } else if (res.cancel) {
          console.log("用户点击取消")
        }
      },
    })
  },

  setSingle_H() {
    let height = window_w / this.data.gird
    this.setData({
      single_h: height,
    })
    this.buildArr()
  },
  changeSingleColor(e) {
    let btn = this.data.active_btn

    if (btn == "edit" || btn == "clear") {
      let item = e.currentTarget.dataset.set
      let arr = this.data.dyadic_arr
      arr[item[0]][item[1]] = btn == "edit" ? this.data.pen_color : "#fff"

      if (this.data.h_pointer < this.data.history.length - 1) {
        this.data.history.splice(this.data.h_pointer + 1)
      }

      this.data.history.push(JSON.parse(JSON.stringify(arr)))

      this.setData({
        dyadic_arr: arr,
      })
      console.log(arr)
      this.data.h_pointer++
    }
  },
  // 重置画布大小
  onFresh() {
    // @ts-ignore
    wx.showToast({
      title: "恢复默认画布大小",
      icon: "none",
      duration: 2000,
    })
    this.setData({
      scale: 1,
      x: 0,
      y: 0,
      animation: true,
      slider: 0,
    })
    setTimeout(() => {
      this.setData({
        animation: false,
      })
    }, 1000)
  },
  onMoveTap(event) {
    if (!this.data.active_btn != "move") {
      this.setData({
        active_btn: "move",
      })
      // @ts-ignore
      wx.showToast({
        title: "可拖拽移动画布",
        icon: "none",
        duration: 2000,
      })
    }
  },
  onEditTap() {
    this.setData({
      active_btn: "edit",
    })
  },
  onClearTap() {
    this.setData({
      active_btn: "clear",
    })
  },
  onSaveTap() {
    this.setData({
      visible_save: true,
    })
  },
  onBrowseTap() {
    this.setData({
      can_eyes: !this.data.can_eyes,
    })
  },
  onRollbackTap() {
    if (this.data.history.length == 0 || this.data.h_pointer == 0) {
      // @ts-ignore
      wx.showToast({
        title: "已经回退到最初",
        icon: "none",
        duration: 1000,
      })
      return
    }
    this.data.h_pointer--
    let history = JSON.parse(
      JSON.stringify(this.data.history[this.data.h_pointer])
    )
    this.setData({
      dyadic_arr: history,
    })
  },
  onRollfrontTap() {
    if (this.data.h_pointer == this.data.history.length - 1) {
      // @ts-ignore
      wx.showToast({
        title: "已经到最新",
        icon: "none",
        duration: 1000,
      })
      return
    }
    this.data.h_pointer++
    let history = JSON.parse(
      JSON.stringify(this.data.history[this.data.h_pointer])
    )
    this.setData({
      dyadic_arr: history,
    })
  },
  selectPenColor(e) {
    let item = e.currentTarget.dataset.item
    this.setData({
      pen_color: item,
    })
  },
  mywork() {
    wx.showToast({
      title: "敬请期待",
      icon: "none",
      duration: 2000,
    })

    // wx.navigateTo({
    //   url: "/pages/my/my",
    // })
  },
  onColorTap() {
    wx.showToast({
      title: "调色板敬请期待",
      icon: "none",
      duration: 2000,
    })
  },
})
