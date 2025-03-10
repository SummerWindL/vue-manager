<template>
    <div class="puzzle-container">
      <div class="puzzle-header">
        <h2>滑动拼图验证</h2>
        <div class="upload-controls">
        <!-- 新增上传组件 -->
            <Upload 
            action=""
            :before-upload="handleBeforeUpload"
            accept="image/*"
            class="upload-btn"
            >
                <Button 
                    type="primary" 
                    icon="md-cloud-upload"
                    style="margin-right: 15px;border-radius: 4px;"
                >
                    <span style="vertical-align: middle">上传拼图图片</span>
                </Button>
        </Upload>
        <Button type="primary" @click="startGame">开始游戏</Button>
      </div>
    </div>
      <canvas 
        ref="puzzleCanvas"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        width="400" 
        height="400">
      </canvas>
  
      <div class="puzzle-controls">
        <Button ghost @click="shufflePieces">打乱顺序</Button>
        <Button type="success" @click="checkResult">验证结果</Button>
        <Button @click="$router.go(-1)">返回</Button>
      </div>
      <div class="history-section">
            <div class="history-header">
                <h3>历史记录</h3>
                <Button type="info" ghost @click="fetchHistory" class="refresh-btn">
                    <Icon type="md-refresh" />刷新记录
                </Button>
            </div>
            
            <!-- 统计信息 -->
            <div class="stats-box">
                <span class="success-stat">成功: {{ successCount }}次</span>
                <span class="fail-stat">失败: {{ failCount }}次</span>
            </div>
            <!-- 分组展示 -->
            <div class="history-group" v-if="successGroup.length">
                <h4>成功记录 ({{ successGroup.length }})</h4>
                <div class="history-list">
                    <div v-for="(item, index) in successGroup" :key="'success-'+index" class="history-item">
                        <Icon 
                            type="md-close-circle" 
                            class="delete-icon" 
                            @click.stop="deleteHistoryRecord(item.id)"
                        />
                        <img :src="item.thumbnail" class="history-thumbnail">
                        <div class="history-info">
                            <span :style="{color: '#19be6b'}">成功</span>
                            <time>{{ item.time }}</time>
                        </div>
                    </div>
                </div>
            </div>
            <div class="history-group" v-if="failGroup.length">
                <h4>失败记录 ({{ failGroup.length }})</h4>
                <div class="history-list">
                    <div v-for="(item, index) in failGroup" :key="'fail-'+index" class="history-item">
                        <Icon 
                            type="md-close-circle" 
                            class="delete-icon" 
                            @click.stop="deleteHistoryRecord(item.id)"
                        />
                        <img :src="item.thumbnail" class="history-thumbnail">
                        <div class="history-info">
                            <span :style="{color: '#ed4014'}">失败</span>
                            <time>{{ item.time }}</time>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
  </template>
  
  <script>
  import base from '@/api/base'
  import http from '@/api/http'
  export default {
    data() {
      return {
        ctx: null,
        image: null,
        pieces: [],
        selectedPiece: null,
        isDragging: false,
        offset: { x: 0, y: 0 },
        imgWidth: 0,
        imgHeight: 0,
        canvasSize: 400, // 保持画布基础尺寸
        uploadedImage: null, // 新增上传图片缓存
        historyList: [] // 新增历史记录
      }
    },
    mounted() {
      this.initCanvas();
      this.loadImage();
      this.fetchHistory(); // 新增初始化时获取历史记录
    },
    computed: {
        successCount() {
            return this.historyList.filter(item => item.success).length
        },
        failCount() {
            return this.historyList.filter(item => !item.success).length
        },
        successGroup() {
            return this.historyList.filter(item => item.success)
        },
        failGroup() {
            return this.historyList.filter(item => !item.success)
        }
        },
    methods: {
        async fetchHistory() {
            try {
                const response = await http.get('/puzzle/history')
                // 处理标准响应结构
                if (response.resultcode === 0) {
                    this.historyList = response.data.map(item => ({
                        id: item.id, // 新增id字段
                        thumbnail: item.thumbnail,
                        time: new Date(item.completeTime).toLocaleString(),
                        success: item.success
                    }))
                } else {
                    throw new Error(response.resultmsg)
                }
            } catch (error) {
                this.$Message.error(`获取历史记录失败: ${error.message}`)
            }
        },
        async deleteHistoryRecord(id) {
            try {
                const response = await http.delete(`/puzzle/history/${id}`)
                if (response.resultcode === 0) {
                    this.historyList = this.historyList.filter(item => item.id !== id)
                    this.$Message.success('记录删除成功')
                }
            } catch (error) {
                this.$Message.error(`删除失败: ${error.message}`)
            }
        },
        async addHistory(isSuccess) {
            try {
                const thumbnail = this.$refs.puzzleCanvas.toDataURL();
                const response = await http.post('/puzzle/savehistory', {
                    thumbnail,
                    completeTime: new Date().toISOString(),
                    success: isSuccess
                });

                if (response.resultcode === 0) {
                    this.historyList.unshift({
                        id: response.data.id,  // 新增id字段
                        thumbnail: response.data.thumbnail || thumbnail,
                        time: new Date(response.data.completeTime).toLocaleString(),
                        success: response.data.success
                    });
                    this.$Message.success('记录保存成功');
                }
            } catch (error) {
                this.$Message.error('保存记录失败: ' + error.message);
            }
        },
        // 新增图片上传处理
        handleBeforeUpload(file) {
        const isValid = file.type.startsWith('image/')
        const isUnder2MB = file.size / 1024 / 1024 < 2
        
        if (!isValid) {
            this.$Message.error('仅支持图片文件格式')
            return false
        }
        if (!isUnder2MB) {
            this.$Message.error('图片大小不能超过2MB')
            return false
        }
        
        this.loadImageFile(file)
        return false // 阻止自动上传
        },
        // 新增图片加载方法
        loadImageFile(file) {
            const reader = new FileReader()
            reader.onload = (e) => {
                this.uploadedImage = e.target.result
                this.$Message.success('图片上传成功，点击开始游戏使用新图')
            }
            reader.readAsDataURL(file)
        },
        startGame() {
            if (!this.uploadedImage) {
                this.$Message.info('正在使用默认图片')
            }
            // 清空现有拼图块
            this.pieces = [];
            // 重置canvas尺寸
            const canvas = this.$refs.puzzleCanvas;
            canvas.width = this.canvasSize;
            canvas.height = this.canvasSize;
            // 重新初始化拼图
            this.loadImage();
        },
      initCanvas() {
        this.ctx = this.$refs.puzzleCanvas.getContext('2d');
      },
      loadImage() {
        // 清空旧拼图
        this.pieces = [];
        const imageSource = this.uploadedImage || require('@/assets/img/puzzle-default.jpg')
        this.image = new Image()
        // 添加加载完成提示
        this.$Message.info('游戏开始！拖动碎片完成拼图');
        this.image = new Image();
        this.image.src = require('@/assets/img/puzzle-default.jpg');
        this.image.onload = () => {
            // 自动获取图片原始尺寸
            this.imgWidth = this.image.naturalWidth;
            this.imgHeight = this.image.naturalHeight;
            
            // 根据图片比例调整画布尺寸
            const maxSize = 600;
            const ratio = Math.min(
                maxSize / this.imgWidth,
                maxSize / this.imgHeight
            );
            this.canvasSize = Math.min(
                this.imgWidth * ratio, 
                this.imgHeight * ratio
            );
            
            // 设置canvas尺寸
            const canvas = this.$refs.puzzleCanvas;
            canvas.width = this.canvasSize;
            canvas.height = this.canvasSize;
            
            this.initPieces();
        };
        this.image.onerror = () => {
            this.$Message.error('图片加载失败')
        }
        this.image.src = imageSource
       
      },
      initPieces() {
        const rows = 3;
        const cols = 3;
        const pieceWidth = this.imgWidth / cols;
        const pieceHeight = this.imgHeight / rows;
        const canvasPieceSize = this.canvasSize / 3;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
            this.pieces.push({
                // 修正坐标字段命名（原currentX/Y改为x/y）
                x: j * canvasPieceSize,  // ← 修正这里
                y: i * canvasPieceSize,  // ← 修正这里
                correctX: j * canvasPieceSize,
                correctY: i * canvasPieceSize,
                originalX: j * pieceWidth,
                originalY: i * pieceHeight,
                isActive: false
            });
            }
        }
        this.shufflePieces();
      },
      shufflePieces() {
        // Fisher-Yates洗牌算法
        for (let i = this.pieces.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            // 修正交换的字段为x/y
            [this.pieces[i].x, this.pieces[j].x] = [this.pieces[j].x, this.pieces[i].x]; // ← 修正这里
            [this.pieces[i].y, this.pieces[j].y] = [this.pieces[j].y, this.pieces[i].y]; // ← 修正这里
        }
        this.drawPieces();
      },
      drawPieces() {
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
    const pieceSize = this.canvasSize / 3;
    
    this.pieces.forEach(piece => {
      this.ctx.drawImage(
            this.image,
            piece.originalX, piece.originalY, 
            this.imgWidth/3, this.imgHeight/3,
            piece.x, piece.y,  // 修正这里：currentX/Y → x/y
            pieceSize, pieceSize
        );
        this.drawPieceBorder(piece);
        });
      },
      drawPieceBorder(piece) {
        const pieceSize = this.canvasSize / 3;  // ← 新增计算
        this.ctx.strokeStyle = piece.isActive ? '#2d8cf0' : '#ddd';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(piece.x, piece.y, pieceSize, pieceSize); // ← 修正这里
      },
      handleMouseDown(e) {
        const rect = this.$refs.puzzleCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
  
        this.selectedPiece = this.pieces.find(piece => 
          x > piece.x && x < piece.x + 133 &&
          y > piece.y && y < piece.y + 133
        );
  
        if (this.selectedPiece) {
          this.isDragging = true;
          this.offset = {
            x: x - this.selectedPiece.x,
            y: y - this.selectedPiece.y
          };
          this.selectedPiece.isActive = true;
          this.drawPieces();
        }
      },
      handleMouseMove(e) {
        if (!this.isDragging || !this.selectedPiece) return;
  
        const rect = this.$refs.puzzleCanvas.getBoundingClientRect();
        const newX = e.clientX - rect.left - this.offset.x;
        const newY = e.clientY - rect.top - this.offset.y;
  
        // 限制移动范围
        const pieceSize = this.canvasSize / 3;  // ← 新增计算
        this.selectedPiece.x = Math.max(0, Math.min(newX, this.canvasSize - pieceSize)); // ← 修正这里
        this.selectedPiece.y = Math.max(0, Math.min(newY, this.canvasSize - pieceSize)); // ← 修正这里
        
        this.drawPieces();
      },
      handleMouseUp() {
        this.isDragging = false;
        if (this.selectedPiece) {
          this.selectedPiece.isActive = false;
          this.selectedPiece = null;
          this.drawPieces();
        }
      },
      checkResult() {
        const isComplete = this.pieces.every(piece => 
            Math.abs(piece.x - piece.correctX) < 5 && 
            Math.abs(piece.y - piece.correctY) < 5
        );

        if (isComplete) {
            this.$Message.success('验证成功！');
            this.addHistory(true);
        } else {
            this.$Message.error('拼图未完成，请继续努力！');
            this.addHistory(false);
        }
      }
    }
  }
  </script>
  
  <style scoped>
  /* 新增上传控件样式 */
.upload-controls {
  display: flex;
  gap: 15px;
  align-items: center;
}

.upload-btn >>> .ivu-btn-primary {
    background-color: #2d8cf0;
    border-color: #2d8cf0;
    transition: all 0.2s ease-in-out;
    
    &:hover {
        background-color: #57a3f3;
        border-color: #57a3f3;
        box-shadow: 0 2px 6px rgba(45,140,240,0.2);
    }
    
    .ivu-icon {
        font-size: 16px;
        margin-right: 6px;
    }
}
  .puzzle-container {
    max-width: 600px;
    margin: 20px auto;
    padding: 30px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
  }
  
  .puzzle-header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 15px;
    align-items: center;
    margin-bottom: 20px;
  }
  
  canvas {
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.3s;
    max-width: 100%;
    height: auto!important;
    aspect-ratio: 1/1;
  }
  
  canvas:hover {
    border-color: #2d8cf0;
  }
  
  .puzzle-controls {
    margin-top: 20px;
    display: flex;
    gap: 15px;
    justify-content: center;
  }
  .history-section {
  margin-top: 30px;
  border-top: 1px solid #e8eaec;
  padding-top: 20px;
}

.history-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.history-item {
  background: #f8f8f9;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: relative;
}

/* 修复悬停选择器语法 */
.history-item:hover .delete-icon {
  display: block;
}

.delete-icon {
    position: absolute;
    top: 4px;
    right: 4px;
    color: #ff4d4f; /* 使用更醒目的红色 */
    cursor: pointer;
    display: none;
    z-index: 2;
    background: #fff; /* 纯白背景 */
    border-radius: 50%;
    padding: 4px; /* 增大点击区域 */
    transition: all 0.2s;
    font-size: 20px; /* 增大图标尺寸 */
    box-shadow: 0 2px 8px rgba(0,0,0,0.15); /* 新增投影 */
    border: 1px solid #ffccc7; /* 增加边框 */
}

.delete-icon:hover {
    transform: scale(1.2); /* 增强悬停动画 */
    color: #f5222d;
    box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    border-color: #ff4d4f;
}

.history-thumbnail {
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-bottom: 1px solid #e8eaec;
}

.history-info {
  padding: 8px;
  font-size: 12px;
  line-height: 1.5;
}

.history-info time {
  color: #808695;
  display: block;
  margin-top: 2px;
}
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.refresh-btn {
  padding: 4px 12px;
}

.stats-box {
  margin: 10px 0;
  padding: 8px;
  background: #f8f8f9;
  border-radius: 4px;
}

.stats-box span {
  margin-right: 20px;
  font-weight: 500;
}

.success-stat {
  color: #19be6b;
}

.fail-stat {
  color: #ed4014;
}

.history-group h4 {
  margin: 15px 0;
  color: #666;
  font-size: 14px;
}
  </style>