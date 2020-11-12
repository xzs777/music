<template>
  <div>
    <nav-header></nav-header>
    <div class="main-nav">
      <div class="main-nav-tt">
        <!-- <img :src="userMsg.pic" alt /> -->
        <div class="main-nav-text">
          <div class="main-tt-name">
            <span>歌单</span>
            歌单名
          </div>
          <!-- <div class="main-tt-label">
            <span style="color:#416bc8">{{userMsg.author}}</span>
            &nbsp;&nbsp;&nbsp;{{userMsg.time| dataFormat}}
          </div>
          <div class="main-tt-label">
            标签:
            <span v-for="(item,i) in userMsg.tag" :key="i">{{item + " "}}</span>
          </div>
          <div class="main-tt-label">描述: {{userMsg.discription}}</div> -->
          <div class="main-tt-btn">
            
            <el-button type="danger" size="small"icon="el-icon-video-play" @click="playMusicAtonce(songsList)">立即播放</el-button>

            <!-- 只能删除自己的歌单 -->
            <el-button type="danger" size="small"icon="el-icon-delete" @click="deleteMyList" v-if="isMyList()">删除歌单</el-button>

            <!-- 只能收藏别人的歌单 -->
            <el-button type="danger" size="small"icon="el-icon-folder-add" @click="addToMyList" v-if="!isMyList()">收藏歌单</el-button>

          </div>
        </div>
      </div>
      <div class="main-song-list">
        <el-table :data="songsList" style="width: 100%;" :stripe="true" @row-click="getMusicUrl" :show-header="false">
          <el-table-column type="index" width="60px"></el-table-column>
          <el-table-column prop="" label="封面">
            <template slot-scope="scoped">
              <div class="music-img-title">
                <!-- 封面图片 -->
                <el-image :src="require('@/store/covers/'+scoped.row.pic)"
                  style="width: 50px ; height: 50px;border-radius: 4px;margin-right: 10px;">
                  <div slot="placeholder" class="image-slot">
                    <i class="el-icon-picture" style="font-size:50px;color:#f1f1f1"></i>
                  </div>
                </el-image>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="歌曲名">
          </el-table-column>
          <el-table-column prop="author" label="歌手" width="180">
          </el-table-column>
          <el-table-column prop="album" label="专辑" width="180"></el-table-column>
          <el-table-column prop="time" label="" width="80" v-if="isMyList()">
            <template slot-scope="scope">
              <!-- 删除歌曲 -->
              <el-button type="danger" icon="el-icon-delete" circle size="mini"
                @click="deleteMusicFromList(scope.row.id)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 选择收藏对话框 -->
    <!-- <el-dialog title="选择歌单" :visible.sync="addDialogVisible" width="30%" @close="loginDialogClose">
      <el-form :model="addForm" status-icon :rules="addRules" ref="addRef" label-width="60px">
        <el-form-item label="歌单">
          <el-select v-model="addForm.choose"  placeholder="请选择歌单">
            <el-option v-for="(item, i) in userMusicList" label="item.name" value="item.id"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="danger" @click="addToMyList()">确 定</el-button>
      </span>
    </el-dialog> -->


  </div>
</template>

<script>
  import NavHeader from '../common/Navheader.vue'
  export default {
    data() {
      return {
        addDialogVisible:false,
        ListName: '',
        createid:'',
        songsList: [],
        userMusicList: [
          {
            name: '歌单1',//歌单名
            id: '1',//歌单id
            createid: '1',//创建者id
            musiclist: [],//音乐列表
          }
        ],
        addForm:{
          choose:''//选择的歌单
        }
      }
    },
    components: {
      'nav-header': NavHeader
    },

    // 监听vuex 当前歌单id数据变化 进行列表刷新
    watch: {
      '$store.state.thisPlaylistId': function (newFlag, oldFlag) {
        if (newFlag !== oldFlag) {
          this.getPlayList()
        }
      }
    },

    methods: {


      // 获取歌单
      async getPlayList() {

        const id = window.sessionStorage.getItem('playListId')//歌单id
        this.$request.get('`fdasfsplaylist/detail?id=${id}`').then(res => {

          this.createid = res.createid//创建者id
          this.ListName = res.data.Name//歌单名
          const arrData = []//获取歌曲列表
          res.data.Musiclist.forEach(item => {
            const arr = {}
            arr.name = item.name//歌曲名
            arr.author = item.artist//作者
            arr.id = item.id//歌曲id
            arr.album = item.album//专辑名
            arr.pic = item.coverurl//封面地址
            arr.src = item.src//歌曲地址
            arrData.push(arr)
          })
          this.songsList = arrData

        }).catch(err => {

          //测试数据
          this.createid = '2'//创建者id
          this.ListName = '歌单1'//歌单名


          const arrData = []
          

          const arr1 = {}
          arr1.name = 'name'
          arr1.author = 'author'
          arr1.id = '1'
          arr1.album = 'album'
          arr1.pic = 'cover1.jpg'
          arr1.src = 'music1.mp3'
          arrData.push(arr1)

          //测试数据
          const arr2 = {}
          arr2.name = 'name'
          arr2.author = 'author'
          arr2.id = '2'
          arr2.album = 'album'
          arr2.pic = 'cover2.jpg'
          arr2.src = 'music2.mp3'
          arrData.push(arr2)

          this.songsList = arrData

          this.$message.error('未找到相应歌曲');
          console.log(window.sessionStorage.getItem('userId'))
        })
      },


      // 点击歌单中的歌曲并播放
      async getMusicUrl(obj) {
        let music = {}
        music = {
          title: obj.name,
          artist: obj.author,
          pic: require('@/store/covers/' + obj.pic),   // cover1.jpg
          src: require('@/store/musicfiles/' + obj.src),// music1.src
          id: obj.id
        }
        window.sessionStorage.setItem('nowMusic', JSON.stringify(music))
        this.$store.dispatch('dealAutoPlay', music)
      },


      //获取用户创建的歌单
      getuserMusicList() {
        const { data: res } = this.$request.get()
        this.userMusicList = res.data;
      },

      //删除自己歌单中的歌曲  musicid--歌曲id
      async deleteMusicFromList(musicid) {
        const id = window.sessionStorage.getItem('playListId')//歌单id
        this.$request.get('`fdasfsplaylist/detail?id=${id}`').then(res => {
          this.$message.error('删除成功');        
        }).catch(err => {
          this.$message.error('删除失败');
        })
      },


      //判断是否为自己创建的歌单
      //不是自己创建的不能删除里面的歌曲或删除歌单
      isMyList(){
        return window.sessionStorage.getItem('userId')==this.createid;
      },


      //删除歌单（只能删除自己的歌单）
      deleteMyList(){
        const id = window.sessionStorage.getItem('playListId')//获取歌单id
        this.$request.get('`fdasfsplaylist/detail?id=${id}`').then(res => {
          this.$message.error('删除成功');
          this.$router.push('music');        
        }).catch(err => {
          this.$message.error('删除失败');
          //删除后返回
          this.$router.push('music');
        })   
      },

      


      //收藏歌单(只能收藏别人的歌单)
      addToMyList(){
        const id = window.sessionStorage.getItem('playListId')//获取歌单id
        const userId = window.sessionStorage.getItem('userId')//获取用户id

        this.$request.get('`fdasfsplaylist/detail?id=${id}`').then(res => {
          this.$message.error('收藏成功');
          this.$router.push('music');        
        }).catch(err => {
          this.$message.error('收藏失败');
        }) 
      },


      // //打开收藏对话框
      // openDialog(){
      //   //获取用户创建的歌单
      //   const { data: res } = this.$request.get()
      //   this.userMusicList = res.data;
      //   this.addDialogVisible = true;
      // }

    },
    created() {
      this.getPlayList()
    }
  }
</script>
<style lang="less" scoped>
  .main-nav .main-nav-tt img {
    width: 130px !important;
    height: 130px !important;
  }

  .main-nav .main-tt-name {
    display: flex;
    align-items: center;
  }

  .main-nav .main-tt-name span {
    border: 2px solid red;
    font-weight: 600;
    margin-right: 10px;
    border-radius: 4px;
    color: red;
    padding: 0px 10px;
    font-size: 12px;
    display: inline-block;
    height: 18px;
    line-height: 18px;
  }

  .main-nav .main-nav-tt .main-tt-label {
    height: 20px;
    line-height: 20px;
    color: rgba(0, 0, 0, 0.6);
    font-weight: 600;
    max-width: 300px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .main-nav .main-nav-tt .main-tt-btn {
    margin-top: 10px;
  }
</style>