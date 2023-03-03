<template>
  <div class="word-2-pdf">
    <Upload
        ref="uploadFile"
        multiple
        type="drag"
        action="//localhost:8071/api/wod2Pdf/wordUploadAndConvert2Pdf/"
        :on-success="uploadSucess"
        :on-error="uploadError"
        :before-upload="beforeUpload"
        :on-remove="removeFile"
        :max-size="10240"
        :on-exceeded-size="handleMaxSize">
        <div style="padding: 20px 0">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
            <p>点击或者拖拽文件到此上传</p>
        </div>
    </Upload>
    <br>
    <Button :size="buttonSize" 
            icon="ios-download-outline" 
            type="primary" 
            v-if="showDownloadBtn" 
            @click="downLoadFile">下载</Button>
  </div>
</template>
<script>
import base from '@/api/base'; // 导入接口域名列表
import axios from '@/request/http'; // 导入http中创建的axios实例
  export default {
    name: 'Word2Pdf',
    data: function () {
      return {
        showDownloadBtn: false,
        username: '',
        password: '',
        remenber: false,
        buttonSize: 'large',
        filePath: ''
      }
    },
    methods: {
        handleMaxSize() {
            this.$toast.show('文件大小超出限制，只允许上传10M以内的文件');
        },
        removeFile (file, fileList){
            console.log(file, fileList)
        },
        uploadSucess(response, file, fileList) {
            this.$toast.show('上传成功' , 2000);
            /**
             * 以下代码保证每次只保留当前上传文件。历史文件全部清除
             */
            this.clearFileList(file, fileList);
            //成功之后需要出现下载按钮
            this.showDownloadBtn = true;
            this.filePath = response.data;
        },
        downLoadFile() {
            this.downloadLoading = true;
            let params = {
                fileUrl: this.filePath,
                responseType:'blob', //设置响应的数据类型为一个包含二进制数据的 Blob 对象，必须设置
                headers:{Authorization :'Bearer ' + sessionStorage.getItem('access_token')}
            }
            axios.get(`${base.tomcat_url}/api/wod2Pdf/downLoadFile?fileUrl=`+ this.filePath,params).then(res => {
                this.downloadLoading = false
                if (!res) {
                    this.$message.error("下载模板文件失败");
                    return false;
                }
                const blob = new Blob([res.data], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'});
                const downloadElement = document.createElement('a');
                const href = window.URL.createObjectURL(blob);
                let contentDisposition = res.headers['content-disposition'];  //从response的headers中获取filename, 后端response.setHeader("Content-disposition", "attachment; filename=xxxx.docx") 设置的文件名;
                let patt = new RegExp("filename=([^;]+\\.[^\\.;]+);*");
                let result = patt.exec(contentDisposition);
                let filename = decodeURI(result[1]);
                downloadElement.style.display = 'none';
                downloadElement.href = href;
                downloadElement.download = filename ; //下载后文件名
                document.body.appendChild(downloadElement);
                downloadElement.click(); //点击下载
                document.body.removeChild(downloadElement); //下载完成移除元素
                window.URL.revokeObjectURL(href); //释放掉blob对象
            }).catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        /**
         * 清空文件列表数据
         * @param {*} file 
         * @param {*} fileList 
         */
        clearFileList(file, fileList){
            //清除之前的上传列表只保留当前列表数据
            this.$refs.uploadFile.clearFiles();
            fileList.splice(0, fileList.length); //清空
            fileList.push(file);
            this.$refs.uploadFile.fileList = fileList;
        },
        uploadError(error, file, fileList){
            console.log(error, file, fileList);
            this.$toast.show('上传失败！' , 2000);
        },
        beforeUpload(file) {
            //判断文件类型，如果不是.doc或者docx结尾不允许上传
            console.log(file);
            let arr = file.name.split('.');
            let type = arr[arr.length - 1];
            if(type == 'doc'||type == 'docx'){
                return true;
            }else{
                this.$toast.show('不支持的文件类型！' , 2000);
                return false;
            }
        }
    }
  }
</script>
