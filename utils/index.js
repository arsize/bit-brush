export const getcolor = (color, opacity) => {
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/
  if (reg.test(color)) {
    if (color.length === 4) {
      var colorNew = "#"
      for (var i = 1; i < 4; i += 1) {
        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1))
      }
      color = colorNew
    }
    var colorChange = []
    for (var i = 1; i < 7; i += 2) {
      colorChange.push(parseInt("0x" + color.slice(i, i + 2)))
    }
    return colorChange
  } else {
    return color
  }
}

/**
 * 多维数组转一维
 * @param {*} data
 * @returns
 */
export function restoreData(data) {
  const result = []
  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[i].length; j++) {
      result.push(data[i][j][0], data[i][j][1], data[i][j][2], 255)
    }
  }
  return result
}

export function wxfileTobase64(url, ishead = false) {
  return new Promise((reslove, reject) => {
    wx.getFileSystemManager().readFile({
      filePath: url, //选择图片返回的相对路径
      encoding: "base64", //编码格式
      success: (res) => {
        //成功的回调
        reslove((ishead ? "data:image/jpeg;base64," : "") + res.data)
      },
      fail: (err) => {
        reject(err)
      },
    })
  })
}
