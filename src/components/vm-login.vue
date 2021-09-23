<template>
  <Row class="vm-login vm-panel">
   <Col span="10" class="login-form">
     <div class="login-header">
       <img src="../assets/img/logo.png" height="80" alt="">
       <p><span>VUE</span>MANAGER</p>
     </div>
     <div class="login-form">
        <Input v-model="username" placeholder="please enter username"></Input>
        <Input v-model="password" type="password" placeholder="Please enter password"></Input>
        <Button type="primary" v-on:click ="login()">Login</Button>
     </div>
     <div class="login-footer">
       <Checkbox v-model="remenber">Remenber</Checkbox>
       <span class="forget"><a href="#">Forget Password</a></span>
     </div>
   </Col>
   <Col span="14" class="login-ad">
     <span class="photo-author">Photo: Jure Kravanja</span>
   </Col>
  </Row>
</template>
<script>
  export default {
    name: 'VmLogin',
    data: function () {
      return {
        username: '',
        password: '',
        remenber: false
      }
    },
    methods: {
      /**
       * 登录方法
       */
      login() {
        let queryParams = {
          params : {
            DoctorName:"医生名称",
            MachineId:"HST821255555",
            BloodPressure:{
              "HighPressure":"96",
              "Pulse":"65",
              "LowPressure":"57",
              "Result":""
            },
            Temperature:{
              "Temperature":"37",
              "Result":"1"
            },
            Chol:{
              "Chol":"2.77",
              "Result":"1"
            }
          }
        };
        this.$api.login.login(queryParams, {
          api: 123
        }).then(res=> {
          // 执行某些操作
          console.log(JSON.stringify(res));
          if(res.data.success == 'false'){ //失败
            this.$toast.show('登录失败' , 2000);
          }
        })
      }
    }
  }
</script>
