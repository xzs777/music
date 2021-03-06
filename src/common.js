// 用于存放公共处理函数

import Vue from 'vue'

// 播放歌单中的所有歌曲
Vue.prototype.playMusicAtonce = async function (songsList) {
  const musiclist = []
  window.sessionStorage.setItem('musiclist', '')
  const idArr = []
  songsList.forEach(item => {
    idArr.push(item.id)
  })
  // const { data: res } = await this.$request.get(`/song/url?id=${idArr.join(',')}`)
  songsList.forEach(item => {
    let music = {}
    music = {
      title: item.name,
      artist: item.author,
      src: require('@/store/musicfiles/'+item.src),
      pic: require('@/store/covers/'+item.pic),
      id: item.id
    }
    musiclist.push(music)
  })
  if (musiclist.length === songsList.length) {
    const data = JSON.stringify(musiclist)
    window.sessionStorage.setItem('musiclist', data)
    window.sessionStorage.setItem(
      'nowMusic',
      JSON.stringify(musiclist[0])
    )
    this.$store.commit('firstComeMusic', musiclist[0])
    this.$store.commit('addMusicList')
    setTimeout(() => {
      this.$store.state.controlMsc.play()
    }, 1000)
  }
}
