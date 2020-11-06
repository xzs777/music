<template>
  <div class="main">
    <el-row>
      <el-col class="left-list">
        <!-- 关闭、放大、缩小控制 -->
        <div class="control">
          <el-button type="danger" icon="el-icon-circle-close"></el-button>
          <el-button type="warning" icon="el-icon-circle-plus-outline"></el-button>
          <el-button type="success" icon="el-icon-remove-outline"></el-button>
        </div>
        <!-- 用户信息 -->
        <div class="login">
          <div @click="loginDialogVisible= true" v-if="userInfoStatus">
            <i class="el-icon-user"></i>
            <span>未登陆</span>
          </div>
          <div class="userInfo" v-else>
            <img :src="userInfo.avatarUrl" alt />
            <span>{{userInfo.nickname}}</span>
            <i class="el-icon-caret-right" style="margin-left:20px;cursor: pointer;" @click="userLogout"></i>
          </div>
        </div>
        <!-- 左侧菜单选项 -->
        <el-menu :default-active="activePath" background-color="#ededed" text-color="rgba(0,0,0,.8)"
          active-text-color="red" :router="true">
          <el-menu-item index="music" key="1">
            <i class="el-icon-headset"></i>
            <span slot="title">发现音乐</span>
          </el-menu-item>
          <el-row class="left-litle-tt">我的音乐</el-row>
          <el-menu-item index="collection">
            <i class="el-icon-star-on"></i>
            <span slot="title">我的收藏</span>
          </el-menu-item>
          <el-submenu index="1" class="music-list">
            <template slot="title">
              <span>创建的歌单</span>
            </template>
            <template v-for="(item, i) in userMusicList">
              <el-menu-item class="music-list-item" :key="i" v-if="item.creator.userId === userInfo.userId"
                @click="getSonglistMusic(item.id)">{{item.name}}</el-menu-item>
            </template>
          </el-submenu>
          <el-submenu index="2" class="music-list">
            <template slot="title">
              <span>收藏的歌单</span>
            </template>
            <template v-for="(item, i) in userMusicList">
              <el-menu-item class="music-list-item" :key="i" v-if="item.creator.userId !== userInfo.userId"
                @click="getSonglistMusic(item.id)">{{item.name}}</el-menu-item>
            </template>
          </el-submenu>
        </el-menu>
      </el-col>
      <el-col class="right-box">
        <router-view></router-view>
      </el-col>


      <!-- 播放器 -->
      <div class="player-box">
        <aplayer preload="auto" :music="$store.state.playMusic" :list="musicList" ref="musicRef" :listFolded="true"
          :showLrc="isShowLrc" :lrcType="1" :controls=" true" @loadstart="loadStartMusic"></aplayer>
        <i class="el-icon-caret-left el-icon-common" @click="skipBackSong"></i>
        <i class="el-icon-caret-right el-icon-common" @click="skipForwardSong"></i>
        <i class="lrcToggle" :class="isShowLrc ? 'lrcdisplay' : ''" @click="isShowLrc = !isShowLrc">词</i>
        <i></i>
      </div>
    </el-row>

    <!-- 登录框 -->
    <el-dialog title="登录" :visible.sync="loginDialogVisible" width="30%" @close="loginDialogClose">
      <el-form :model="loginForm" status-icon :rules="loginRules" ref="loginRef" label-width="60px">
        <el-form-item label="手机" prop="telephone">
          <el-input type="text" v-model="loginForm.telephone" name="telephone"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="loginForm.password" name="password"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="loginDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="Login()">确 定</el-button>
        </br></br>
        <el-link @click="loginDialogVisible = false , registerDialogVisible = true" type="primary">还没有账号？去注册</el-link>
      </span>
    </el-dialog>

    <!-- 注册框 -->
    <el-dialog title="注册" :visible.sync="registerDialogVisible" width="30%" @close="registerDialogClose">
      <el-form :model="registerForm" status-icon :rules="registerRules" ref="registerRef" label-width="80px"
        label-position="left">
        <el-form-item label="手机号码" required prop="telephone">
          <el-input v-model="registerForm.telephone">
          </el-input>
        </el-form-item>
        <el-form-item label="密码" required prop="password">
          <el-input v-model="registerForm.password" type="password">
          </el-input>
        </el-form-item>
        <el-form-item label="确认密码" required prop="confirmpassword">
          <el-input v-model="registerForm.confirmpassword" type="password">
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="registerForm.email">
          </el-input>
        </el-form-item>
        <el-form-item label="用户名" required prop="username">
          <el-input v-model="registerForm.username">
          </el-input>
        </el-form-item>
        <el-form-item label="性别" required prop="sex">
          <el-select v-model="registerForm.sex">
            <el-option label="男" value="1"></el-option>
            <el-option label="女" value="2"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="头像" required>
          <el-upload class="avatar-uploader" :action="ImgUploadURL" :show-file-list="false"
            :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :headers="headerObj">
            <img v-if="registerForm.imageUrl" :src="registerForm.imageUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button @click="register" style="width:80%" type="primary">注册</el-button>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-link @click="loginDialogVisible = true , registerDialogVisible = false" type="primary">已有账号？去登录</el-link>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  import aplayer from 'vue-aplayer'
  export default {
    data() {
      var checkMobile = (rule, value, callback) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return callback()
        }
        callback(new Error('请输入合法的手机号'))
      }
      var validatePassword = (rule, value, callback) => {
        if (value !== this.registerForm.password) {
          callback(new Error('两次输入密码不一致!'));
        } else {
          callback();
        }
      }
      return {
        // 图片上传URL
        ImgUploadURL: '.../image',
        // 图片头部
        headerObj: {
          Authorization:
            window.sessionStorage.getItem('token')
        },
        loginDialogVisible: false,
        registerDialogVisible: false,
        loginForm: {
          telephone: '',
          password: ''
        },
        registerForm: {
          telephone: '',
          password: '',
          confirmpassword: '',
          email: '',
          username: '',
          sex: '',
          imageUrl: '',
        },


        loginRules: {
          telephone: [
            { required: true, message: '请输入手机号', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'blur' },
            {
              min: 6,
              max: 20,
              message: '密码长度在 6 到 20 个字符',
              trigger: 'blur'
            }
          ]
        },

        registerRules: {
          telephone: [
            { required: true, message: '请输入手机号码!', trigger: 'blur' },
            { min: 11, max: 11, message: '请输入合法的手机号', trigger: 'blur' }
            //{ min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码!', trigger: 'blur' }
          ],
          confirmpassword: [
            { required: true, message: '请再次输入密码!', trigger: 'blur' },
            { validator: validatePassword, trigger: 'blur' }
          ],
          username: [
            { required: true, message: '请输入用户名!', trigger: 'blur' }
          ],
          sex: [
            { required: true, message: '请选择性别!', trigger: 'blur' }
          ],
        },



        //用户信息
        userInfoStatus: true,
        userInfo: {},
        isShowLrc: false,
        firstplayIndex: -1,
        activePath: 'music',
        userMusicList: []
      }
    },
    components: {
      aplayer
    },
    methods: {
      // 登录框关闭
      loginDialogClose() {
        this.$refs.loginRef.resetFields()
      },
      //注册框关闭
      registerDialogClose() {
        this.$refs.loginRef.resetFields()
      },
      // 登录
      Login() {
        this.$refs.loginRef.validate(
          async valid => {
            //点击登录，对表单预验证
            if (!valid)
              return;

            else {
              //请求
              const api = 'http://';
              this.$request.post(api, { ...this.loginForm }).then(res => {

                //提示成功
                this.$message.success('登录成功!');

                //保存token
                localStorage.setItem('token', res.data.token);


                window.sessionStorage.setItem('token', res.data.token);

                //获取用户信息
                this.userInfoStatus = false
                this.userInfo = res.profile
                this.userMusicList = res.playlist

              }).catch(err => {
                this.$message.error('账号或密码错误!');
              })
            }
          }
        );
      },

      register() {
        this.$refs.registerRef.validate(
          async valid => {
            //对注册表单预验证
            if (!valid)
              return;
            else {
              //请求
              const api = 'http://';
              this.$request.post(api, { ...this.registerForm }).then(res => {

                //提示成功
                this.$message.success('注册成功!');

              }).catch(err => {
                this.$message.error('注册失败');
              })
            }
          }
        );
      },

      //图片上传成功
      handleAvatarSuccess(res, file) {
        this.registerForm.imageUrl = URL.createObjectURL(file.raw);
      },
      //图片格式校验
      beforeAvatarUpload(file) {
        const isJPG = file.type === 'image/jpeg';
        const isLt2M = file.size / 1024 / 1024 < 2;

        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG 格式!');
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!');
        }
        return isJPG && isLt2M;
      },

      // 获取用户信息
      async getUserInfo() {
        try {
          const time = new Date().getTime()
          const { data: res } = await this.$request.get(
            `login/status?timestamp=${time}`
          )
          const { data: res1 } = await this.$request.get(
            `user/playlist?uid=${res.profile.userId}`
          )
          this.userInfoStatus = false
          this.userInfo = res.profile
          this.userMusicList = res1.playlist
        } catch (error) { }
      },
      // 用户退出
      async userLogout() {
        this.userInfoStatus = true
        this.userInfo = {}
        await this.$request.get('logout')
        this.$message.success('账号已退出')
      },
      // 切换上一首
      skipBackSong() {
        const listLength = this.$refs.musicRef.musicList.length
        this.$refs.musicRef.playIndex =
          this.$refs.musicRef.playIndex === 0 ||
            this.$refs.musicRef.playIndex === -1
            ? listLength - 1
            : this.$refs.musicRef.playIndex - 1
        setTimeout(() => {
          this.$refs.musicRef.play()
        }, 500)
      },
      // 切换下一首
      skipForwardSong() {
        let step = 1
        if (this.$refs.musicRef.playIndex === -1) {
          step = 2
        }
        const listLength = this.$refs.musicRef.musicList.length
        this.$refs.musicRef.playIndex =
          this.$refs.musicRef.playIndex === listLength - 1
            ? 0
            : this.$refs.musicRef.playIndex + step
        setTimeout(() => {
          this.$refs.musicRef.play()
        }, 500)
      },
      // 加载音乐开始时候 加载歌词
      async loadStartMusic(e) {
        if (
          this.$refs.musicRef.currentMusic.id &&
          this.$refs.musicRef.currentMusic.lrc === undefined
        ) {
          const { data: res } = await this.$request.get(
            `/lyric?id=${this.$refs.musicRef.currentMusic.id}`
          )
          if (res.lrc !== undefined) {
            this.$refs.musicRef.currentMusic.lrc = res.lrc.lyric
          } else {
            this.$refs.musicRef.currentMusic.lrc = '[00:00.000]暂无歌词'
          }
          if (this.isShowLrc) {
            this.isShowLrc = false
            setTimeout(() => {
              this.isShowLrc = true
            }, 300)
          }
        }
      },
      // 获取歌单列表
      async getSonglistMusic(id) {
        this.$store.commit('setPlaylistId', id)
        window.sessionStorage.setItem('playListId', id)
        this.$router.push('playlist')
      }
    },
    computed: {
      musicList: () => {
        // 获取音乐列表
        if (window.sessionStorage.getItem('musiclist')) {
          return JSON.parse(window.sessionStorage.getItem('musiclist'))
        } else {
          return []
        }
      }
    },
    mounted() {
      this.$store.commit('controlMusic', this.$refs.musicRef)
      this.$refs.musicRef.playIndex = this.firstplayIndex
      this.activePath = this.$route.path.replace('/', '')
    },
    watch: {
      $route(to, from) {
        if (to.path.replace('/', '') === 'collection') {
          this.activePath = 'collection'
        } else if (to.path.replace('/', '') === 'music') {
          this.activePath = 'music'
        }
      }
    },
    created() {
      // 记录当前播放
      if (
        window.sessionStorage.getItem('nowMusic') &&
        window.sessionStorage.getItem('musiclist')
      ) {
        this.$store.commit(
          'firstComeMusic',
          JSON.parse(window.sessionStorage.getItem('nowMusic'))
        )
        this.firstplayIndex = JSON.parse(
          window.sessionStorage.getItem('musiclist')
        ).findIndex(
          item =>
            JSON.parse(window.sessionStorage.getItem('nowMusic')).src === item.src
        )
      }
      this.getUserInfo()
    }
  }
</script>
<style lang='less' scoped>
  .main {
    width: 1000px;
    background: #fff;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.23);
    height: 600px;
  }

  .el-menu {
    height: 420px;
    overflow: hidden scroll;
    width: 215px;
  }

  .player-box {
    width: 100%;
    height: 60px;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 999;
  }

  .el-icon-common {
    position: absolute;
    font-size: 30px;
    top: 20px;
    color: red;
    cursor: pointer;
  }

  .el-icon-caret-left {
    left: 50%;
    margin-left: -80px;
  }

  .el-icon-caret-right {
    right: 50%;
    margin-right: -85px;
  }

  .aplayer {
    margin: 0 !important;
  }

  .el-row {
    height: 100%;
  }

  .right-box {
    height: 540px;
    width: 800px;
  }

  .left-list {
    background: #ededed;
    height: 540px;
    width: 200px;
    position: relative;
    overflow: hidden;
  }

  .login {
    height: 70px;
    display: flex;
    align-items: center;
  }

  .el-icon-user {
    width: 40px;
    height: 40px;
    text-align: center;
    border: 1px solid rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    font-size: 22px;
    line-height: 35px;
    margin-left: 20px;
    cursor: pointer;
  }

  span {
    font-size: 14px;
    margin-left: 20px;
    color: rgba(0, 0, 0, 0.6);
    cursor: pointer;
  }

  .userInfo {
    display: flex;
    align-items: center;
  }

  .userInfo img {
    width: 40px;
    height: 40px;
    border: 1px solid rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    margin-left: 20px;
  }

  .left-litle-tt {
    color: rgba(0, 0, 0, 0.6);
    font-size: 12px;
    padding-left: 20px;
    margin-top: 15px;
    height: 28px !important;
  }

  .control {
    height: 40px;
    line-height: 30px;
    background: rgba(255, 255, 255, 0.4);
  }

  .control .el-button {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin: 0;
    margin-left: 8px;
    font-size: 12px;
    padding: 0;
  }

  .lrcToggle {
    border: 1px solid #333;
    font-style: normal;
    width: 18px;
    height: 18px;
    display: inline-block;
    position: absolute;
    top: 22px;
    right: 150px;
    box-sizing: border-box;
    text-align: center;
    line-height: 18px;
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    cursor: pointer;
    border-radius: 2px;
  }

  .lrcdisplay {
    color: red !important;
    border-color: red;
  }

  .lrcToggle:hover {
    color: #000;
  }

  .music-list-item {
    font-size: 12px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 0 20px !important;
  }

  .avatar-uploader {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader:hover {
    border-color: #409EFF;
  }

  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }

  .avatar-uploader {
    width: 178px;
    height: 178px;
    display: block;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>