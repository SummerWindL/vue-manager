<template>
    <div class="word-2-pdf">
        <!-- 添加全局加载遮罩 -->
    <div v-show="loading" class="loading-mask">
      <Icon type="ios-loading" class="loading-icon" size="40"/>
      <div class="loading-text">文件打包中，请稍候...</div>
    </div>
      <div class="upload-container">
        <Upload
          ref="upload"
          multiple
          type="drag"
          :action="uploadUrl"
          :on-success="handleSuccess"
          :on-error="handleError"
          :before-upload="beforeUpload"
          :max-size="10240"
          :on-exceeded-size="handleExceed">
          <div class="upload-area">
            <Icon type="ios-cloud-upload" size="52" color="#2d8cf0"/>
            <p class="upload-text">拖拽或点击选择Word文件（支持多文件）</p>
            <p class="upload-hint">支持格式：.doc/.docx | 单文件最大10MB</p>
          </div>
        </Upload>
        <!-- 添加批量操作栏 -->
        <div class="batch-toolbar" v-if="convertedFiles.length > 0">
            <Checkbox v-model="selectAll">全选</Checkbox>
            <Button 
            type="primary" 
            :disabled="selectedFiles.length === 0"
            @click="handleBatchDownload">
            <Icon type="ios-download-outline"/>
            批量下载({{ selectedFiles.length }})
            </Button>
            <!-- 新增清空按钮 -->
            <Button 
                ghost 
                type="error" 
                class="ml-auto"
                @click="clearFiles">
                <Icon type="ios-trash-outline"/>
                清空列表
            </Button>
        </div>
        <!-- 文件列表展示 -->
        <!-- 修改文件列表项 -->
        <div class="file-list">
            <div 
            v-for="file in convertedFiles" 
            :key="file.pdfPath" 
            class="file-item"
            :class="{ 'selected': selectedFiles.includes(file.pdfPath) }">
            <Checkbox 
                v-model="selectedFiles" 
                :label="file.pdfPath"
                class="file-checkbox">
                <Icon type="ios-document-outline" class="file-icon"/>
                <div class="file-info">
                <span class="file-name">{{ file.original }}</span>
                <span class="file-status">转换完成</span>
                </div>
            </Checkbox>
            <Button 
                type="primary" 
                ghost 
                class="download-btn"
                @click="handleDownload(file.pdfPath)">
                <Icon type="ios-download-outline"/>
                单下载
            </Button>
            </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import base from '@/api/base'
  import axios from '@/request/http'
  
  export default {
    name: 'Word2Pdf',
    data() {
      return {
        loading: false, // 新增加载状态
        uploadUrl: `${base.tomcat_url}/api/wod2Pdf/wordUploadAndConvert2Pdf/`,
        selectedFiles: [], // 存储选中的文件路径
        convertedFiles: [] // 存储已转换文件 { original: 原始文件名, pdfPath: 转换后路径 }
      }
    },
    computed: {
        selectAll: {
            get() {
                return this.convertedFiles.length > 0 && 
                this.selectedFiles.length === this.convertedFiles.length
            },
            set(value) {
                this.selectedFiles = value ? 
                this.convertedFiles.map(f => f.pdfPath) : 
                []
            }
        }
    },
    methods: {
        // 添加批量下载方法
        // async handleBatchDownload() {
        //     for (const pdfPath of this.selectedFiles) {
        //         await this.handleDownload(pdfPath)
        //         // 添加500ms间隔避免浏览器拦截
        //         await new Promise(resolve => setTimeout(resolve, 500))
        //     }
        // },
        clearFiles() {
            this.selectedFiles = []
            this.convertedFiles = []
            this.$refs.upload.fileList = []
        },
        // 修改后的批量下载方法
        async handleBatchDownload() {
            this.loading = true;
            try {
                const res = await axios.post(
                    `${base.tomcat_url}/api/wod2Pdf/batchDownLoad`,
                    this.selectedFiles, // 直接发送数组，而不是包装成对象
                    {
                        responseType: 'blob',
                        headers: {
                            Authorization: 'Bearer ' + sessionStorage.getItem('access_token'),
                            'Content-Type': 'application/json' // 明确指定JSON类型
                        }
                    }
                 );

                // 处理压缩包文件名
                const disposition = res.headers['content-disposition'];
                const filenameRegex = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i;
                const matches = filenameRegex.exec(disposition);
                let fileName = 'converted-' + new Date().getTime() + '.zip';
                
                if (matches && matches[1]) {
                    // 增加替换加号的处理
                    fileName = decodeURIComponent(matches[1].replace(/\+/g, '%20'));
                }

                // 创建下载链接
                const blob = new Blob([res.data], { type: 'application/zip' });
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(link.href);

            } catch (error) {
                console.error('批量下载失败:', error);
                this.$toast.show('压缩包下载失败，请重试');
            } finally {
                this.loading = false;
            }
        },
      // 上传前校验
      beforeUpload(file) {
        const isValidType = ['doc', 'docx'].includes(file.name.split('.').pop().toLowerCase())
        if (!isValidType) {
          this.$toast.show('仅支持Word文档格式（.doc/.docx）')
        }
        return isValidType
      },
  
      // 修正后的上传成功处理
      handleSuccess(response, file, fileList) {
        this.convertedFiles = [
          ...this.convertedFiles,
          {
            original: file.name,
            pdfPath: response.data
          }
        ]
        this.$refs.upload.fileList = fileList.filter(f => f.status !== 'success')
      },
  
      // 修正后的下载方法
      async handleDownload(pdfPath) {
        try {
          const res = await axios.get(`${base.tomcat_url}/api/wod2Pdf/downLoadFile`, {
            params: { fileUrl: pdfPath },
            responseType: 'blob',
            headers: {
              Authorization: 'Bearer ' + sessionStorage.getItem('access_token')
            }
          })
  
          // 修复文件名乱码的正则处理
          const disposition = res.headers['content-disposition']
          const filenameRegex = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i
          const matches = filenameRegex.exec(disposition)
          const fileName = matches && matches[1] ? 
            decodeURIComponent(matches[1]) : // 解码URI组件
            'converted.pdf'
  
          const blob = new Blob([res.data], { 
            type: 'application/pdf' 
          })
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(blob)
          
       
          link.download = fileName
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } catch (error) {
          this.$toast.show('下载失败，请重试')
        }
      },
  
      // 错误处理
      handleError(error) {
        console.error('上传失败:', error)
        this.$toast.show('文件上传失败，请检查网络后重试')
      },
      
      handleExceed() {
        this.$toast.show('文件大小超过10MB限制')
      }
    }
  }
  </script>
  
  <style scoped>
  /* 新增加载遮罩样式 */
.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-icon {
  animation: spin 1s linear infinite;
  color: #2d8cf0;
  margin-bottom: 10px;
}

.loading-text {
  color: #666;
  font-size: 16px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
  .upload-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 30px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  }
  
  .upload-area {
    padding: 40px 0;
    text-align: center;
  }
  
  .upload-text {
    font-size: 16px;
    color: #2d8cf0;
    margin: 15px 0;
  }
  
  .upload-hint {
    font-size: 12px;
    color: #999;
  }
  
  .file-list {
    margin-top: 30px;
  }
  
  .batch-toolbar {
  margin: 20px 0;
  padding: 15px 20px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  justify-content: flex-start; 
  gap: 15px; 
}

.file-list {
  margin-top: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
}

.file-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 12px 20px;
  margin: 0;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.2s;
  background: #fff;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background: #f8fafc;
  transform: translateY(-1px);
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
}

.file-item.selected {
  background: #f0f7ff;
  border-left: 3px solid #2d8cf0;
}

.file-checkbox {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  font-size: 28px;
  color: #2d8cf0;
  flex-shrink: 0;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  display: block;
  color: #303133;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-status {
  font-size: 12px;
  color: #67c23a;
  margin-top: 4px;
}

.download-btn {
  margin-left: 15px;
  flex-shrink: 0;
}
.ml-auto {
    margin-left: auto; 
} 
</style>