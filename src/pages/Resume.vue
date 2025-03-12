<template>
    <div class="container ivu-card" :class="currentTheme">
      <div class="container ivu-card">
      <!-- 重构后的布局结构 -->
      <div class="main-layout">
          <!-- 新增内容片段面板 -->
          <Card class="snippet-panel">
            <template #title>
              <div class="panel-header">
                <div class="panel-title">
                  <Icon type="ios-list"/><span style="margin-left:8px">内容片段</span>
                </div>
                <!-- 主题按钮移到标题右侧 -->
                <Button @click="toggleTheme" class="theme-btn">
                  <Icon :type="themeIcon"></Icon>
                </Button>
              </div>
            </template>
              <List border>
                <ListItem 
                  v-for="(item, index) in contentSnippets" 
                  :key="index"
                  @click.native="insertSnippet(index)"
                  class="snippet-item">
                  <div style="display: flex; align-items: center">
                      <Icon :type="item.icon" style="margin-right:8px"/>
                      <span class="snippet-title">{{ item.title }}</span>
                  </div>
                </ListItem>
              </List>
          </Card>
          <!-- 编辑器区域 -->
          <div class="editor-wrapper">
            <!-- 右侧编辑区域 -->
            <div class="right-panel">
                <div class="toolbar ivu-card ivu-card-bordered">
                  <Button @click="insertSyntax('bold')" title="加粗">
                      <Icon type="md-radio-button-on"/>
                  </Button>
                  <Button @click="insertSyntax('italic')" title="斜体">
                      <Icon type="md-remove"/>
                  </Button>
                    <Dropdown @on-click="handleHeading" transfer>
                      <Button title="标题">
                          <Icon type="md-text"/>
                      </Button>
                        <DropdownMenu slot="list">
                            <DropdownItem v-for="n in 6" :key="n" :name="n">H{{n}}</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Button @click="insertSyntax('link')" title="链接">
                        <Icon type="ios-link"/>
                    </Button>
                    <Button @click="insertSyntax('code')" title="代码块">
                        <Icon type="ios-code"/>
                    </Button>
                    <Button @click="insertSyntax('strike')" title="删除线">
                        <Icon type="md-remove"/>
                    </Button>
                    <Button @click="insertSyntax('hr')" title="水平线">
                        <Icon type="md-remove"/>
                    </Button>
                    <Dropdown transfer>
                      <Button title="列表">
                          <Icon type="ios-list"/>
                      </Button>
                        <DropdownMenu slot="list">
                            <DropdownItem @click.native="insertSyntax('ulist')">无序列表</DropdownItem>
                            <DropdownItem @click.native="insertSyntax('olist')">有序列表</DropdownItem>
                            <DropdownItem @click.native="insertSyntax('task')">任务列表</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                    <Button @click="insertTable" title="表格">
                        <Icon type="md-grid"/>
                    </Button>
                    <Button @click="insertSyntax('image')" title="插入图片">
                        <Icon type="md-image"/>
                    </Button>
                    <Button @click="insertSyntax('quote')" title="引用块">
                        <Icon type="md-quote"/>
                    </Button>
                    <Button @click="downloadMD" title="下载MD文件">
                        <Icon type="md-download"/>
                    </Button>
                    <Button @click="exportPDF" title="导出PDF">
                        <Icon type="md-document"/>
                    </Button>
                </div>
                <div class="edit-preview-container">
                    <div class="editor-box">
                        <Input 
                            v-model="markdownContent" 
                            type="textarea"
                            class="ivu-input-wrapper"
                            placeholder="输入Markdown内容..."
                            :rows="25"
                            @on-change="updatePreview"
                            ref="editor"/>
                    </div>
                    
                    <div class="preview-box">
                        <div class="preview-content" v-html="parsedMarkdown"></div>
                    </div>
                </div>
            </div>
          </div>
      </div>
    </div>
    </div>
  </template>
  
  <script>
  import marked from 'marked'
  import DOMPurify from 'dompurify';
  import html2pdf from 'html2pdf.js';  // 导入html2pdf.js
  
  export default {
    name: 'Resume',
    data() {
      return {
        isDarkTheme: false,
        // 新增内容片段数据
        contentSnippets: [
          {
            title: '联系方式',
            icon: 'ios-call',  // ✅ 正确
            content: `## 📞 联系方式 \n\n- 手机：138-XXXX-XXXX\n- 邮箱：zhangsan@example.com\n`
          },
          {
            title: '个人信息', 
            icon: 'ios-person',  // ✅ 正确
            content: `## 🧑 个人信息\n\n- 年龄：28\n- 学历：本科\n- 工作年限：5年\n`
          },
          {
            title: '教育背景',
            icon: 'ios-school',  // ✅ 正确
            content: `## 🎓 教育背景\n\n**XX大学** \n计算机科学与技术 | 硕士\n2018.09 - 2021.06\n`
          },
          {
            title: '工作经历',
            icon: 'ios-briefcase',  // ✅ 正确
            content: `## 💼 工作经历\n\n**XX科技有限公司** \n全栈工程师 | 2021.07 - 至今\n- 负责前后端架构设计\n- 主导开发XX管理系统\n- 技术团队管理与培训\n`
          },
          {
            title: '项目经验',
            icon: 'ios-folder',  // ✅ 正确
            content: `## 🚀 项目经验\n\n**XX管理系统**\n- 技术栈：Vue3 + Node.js + MySQL\n- 核心功能：权限管理、数据分析模块\n- 成果：提升运营效率40%\n`
          },
          {
            title: '专业技能',
            icon: 'ios-hammer',  // ⚠️ 应改为 ios-hammer-outline
            content: `## 🔧 专业技能\n- 精通Vue全家桶开发\n- 熟悉微服务架构设计\n- 掌握DevOps全流程\n`
          }
        ],
        markdownContent: '',
        parsedMarkdown: ''
      }
    },
    filters: {
      trimPreview(content) {
        const validLine = content.split('\n').find(line => line.trim());
        return validLine ? validLine.substring(0, 40).trim() : '';
      }
    },
    computed: {
      currentTheme() {
        return this.isDarkTheme ? 'dark-theme' : 'light-theme'
      },
      themeIcon() {
        return this.isDarkTheme ? 'ios-sunny' : 'ios-moon'
      }
    },
    mounted() {
      this.updatePreview();
    },
    methods: {
          async exportPDF() {
            const element = document.createElement('div');
            element.innerHTML = this.parsedMarkdown;
            element.className = 'preview-content pdf-export'; // 继承预览样式
            
            const opt = {
                margin:       10,
                filename:     `resume_${new Date().getTime()}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, logging: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
        },
        downloadMD() {
          const blob = new Blob([this.markdownContent], { type: 'text/markdown' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `resume_${new Date().getTime()}.md`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      },
        // 新增片段插入方法
      insertSnippet(index) {
        const snippet = this.contentSnippets[index].content;
        const editor = this.$refs.editor.$el.querySelector('textarea');
        const start = editor.selectionStart;
        
        // 在当前位置直接插入完整片段（保留原换行格式）
        this.markdownContent = 
        this.markdownContent.slice(0, start) +
        snippet +  // 移除前后换行符
        this.markdownContent.slice(start);
        
        this.$nextTick(() => {
        // 自动滚动到插入位置
        editor.scrollTop = editor.scrollHeight;
        editor.focus();
        this.updatePreview();
        });
      },
      toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme
      },
      parseMarkdown(text) {
        return DOMPurify.sanitize(marked.parse(text))
      },
      updatePreview() {
        this.parsedMarkdown = this.parseMarkdown(this.markdownContent)
      },
      insertTable() {
        const table = 
        `| Header1 | Header2 | Header3 |
        |---------|---------|---------|
        | Cell1   | Cell2   | Cell3   |
        | Cell4   | Cell5   | Cell6   |\n\n`;
                this.insertAtCursor(table);
            },
        insertAtCursor(content) {
            const editor = this.$refs.editor.$el.querySelector('textarea');
            const start = editor.selectionStart;
            this.markdownContent = 
                this.markdownContent.slice(0, start) +
                content +
                this.markdownContent.slice(start);
            this.$nextTick(() => {
                editor.focus();
                editor.setSelectionRange(start + content.length, start + content.length);
            });
        },
      insertSyntax(type) {
        const editor = this.$refs.editor.$el.querySelector('textarea');
        const startPos = editor.selectionStart;
        const endPos = editor.selectionEnd;
        const selectedText = editor.value.substring(startPos, endPos);
        
        const syntaxMap = {
            bold: { wrap: '**${text}**', placeholder: '加粗文字' },  // 增加完整包裹语法
            italic: { wrap: '_${text}_', placeholder: '斜体文字' }, // 增加下划线包裹
            link: { wrap: '[${text}](url)', placeholder: '链接文字' },
            code: { wrap: '```\n${text}\n```', placeholder: '代码内容' },
            strike: { wrap: '~~${text}~~', placeholder: '删除线文字' },
            hr: { wrap: '\n---\n', placeholder: '' },
            ulist: { wrap: '- ${text}\n', placeholder: '列表项' },
            olist: { wrap: '1. ${text}\n', placeholder: '列表项' },
            task: { wrap: '- [ ] ${text}\n', placeholder: '任务项' },
            image: { wrap: '![${text}](url)', placeholder: '图片描述' },
            quote: { wrap: '> ${text}\n', placeholder: '引用内容' }
        };
        
        const { wrap, placeholder } = syntaxMap[type];
        const [prefix, suffix] = wrap.split('${text}');
        const newText = prefix + (selectedText || placeholder) + suffix;  // 现在可以正确拼接前缀后缀
        
        this.markdownContent = 
            editor.value.substring(0, startPos) +
            newText +
            editor.value.substring(endPos);
            
            this.$nextTick(() => {
                const newPos = startPos + (selectedText ? 0 : prefix.length);
                editor.setSelectionRange(
                    newPos, 
                    newPos + (selectedText ? selectedText.length : placeholder.length)
                );
                editor.focus();
            });
        },
        handleHeading(level) {
            const header = '#'.repeat(level) + ' ';
            this.markdownContent = this.markdownContent + '\n' + header;
            this.$refs.editor.focus();
        }
    }
  }
  </script>
  
<style scoped>
/* 新增主题样式 */
.dark-theme {
  background: #2d2d2d;
  color: #fff;
}

.dark-theme .ivu-card,
.dark-theme .editor-box,
.dark-theme .preview-box {
  background: #1a1a1a;
  border-color: #333;
}

.dark-theme .snippet-item:hover {
  background: #333 !important;
}

/* 暗黑模式适配 */
.dark-theme .toolbar {
  background: #2d2d2d;
  border-color: #444;
  
  .ivu-btn {
    background: #3a3a3a;
    border-color: #555;
    color: #fff;
    
    &:hover {
      background: #484848;
    }
  }
}
/* 新增容器布局 */
.main-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 12px; /* 缩小间距 */
  height: calc(100vh - 80px); /* 增加底部留白 */
}
.container {
  height: 100vh;
  margin: 0;
  padding: 0; /* 移除容器内边距 */
}
/* 标题区域布局 */
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px; /* 减少内边距 */
}
/* 主题按钮样式 */
.theme-btn {
  padding: 4px 8px !important;
  height: 28px;
  ::v-deep i {
    font-size: 14px;
  }
}
/* 调整后的编辑器容器 */
.editor-wrapper {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
  padding-right: 12px; /* 减少右侧间距 */
}

/* 优化后的左侧面板 */
.snippet-panel {
  ::v-deep {
    .ivu-list-item {
      padding: 12px 16px;
      transition: all 0.2s;
      cursor: pointer;
      &:hover {
        background: #f5f5f6;
        transform: translateX(4px);
      }
      /* 新增点击效果 */
      &:active {
        transform: translateX(8px);
        transition: all 0.1s;
      }
      .snippet-title {
        font-weight: 500;
        line-height: 1.4;
      }
    }
  }
  ::v-deep .ivu-card-head {
    padding: 8px 12px;
  }
  ::v-deep .ivu-card-body {
    padding: 0;
  }
}

.right-panel {
  display: grid;
  grid-template-rows: auto 1fr; /* 改为自动适应高度 */
  gap: 16px;
  height: 100%; /* 改为填充剩余空间 */
  margin-top: -8px; /* 抵消父容器gap的顶部间距 */
  overflow: visible;
}


.edit-preview-container {
  display: grid;
  grid-template-rows: 1fr; /* 确保内部元素撑满高度 */
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  height: 100%;  /* 改为百分比高度 */
  min-height: 500px;
  overflow: visible; /* 新增溢出控制 */
  position: relative;
  z-index: 0; /* 保证编辑器在底层*/
}

.editor-box {
  border: 1px solid #e8eaec;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(28, 31, 35, 0.05);
  padding: 12px;
  height: 100%;
  overflow: hidden; /* 保证内部滚动 */
}

.preview-box {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(28, 31, 35, 0.05);
  height: calc(100vh - 220px); /* 固定高度 */
  overflow-y: auto; /* 添加垂直滚动 */
}

.ivu-input-wrapper {
  height: 100% !important;  /* 恢复完整高度 */
  overflow-y: hidden !important;  /* 禁用容器滚动 */
  border: none !important;
}
/* 调整文本域样式 */
/* 文本域自身添加滚动 */
.ivu-input-wrapper textarea {
  height: 100% !important;
  overflow-y: auto !important;  /* 文本域内部滚动 */
  resize: none;
  border: none !important;
  box-shadow: none !important;
  padding: 12px;  /* 增加内边距 */
}
.preview-content {
  height: 100% !important;
  min-height: 300px;
}

.preview-content {
  padding: 24px;
  font-size: 14px;
  line-height: 1.8;
  text-align: left; /* 新增左对齐属性 */
  min-height: min-content; /* 确保内容撑开 */
  h1, h2 {
    margin: 1em 0 0.5em;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #eee;
  }
}

.toolbar {
  position: sticky; 
  transform: translateZ(0); 
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 6px 12px;
  gap: 8px; /* 使用间距代替margin */
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(28, 31, 35, 0.08);
  overflow-x: auto; /* 添加水平滚动 */
  white-space: nowrap;

  /* 新增滚动条样式*/
  &::-webkit-scrollbar {
    height: 4px;
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #e8eaec;
    border-radius: 2px;
  }
  .ivu-dropdown {
    position: static; 
  }

  .ivu-btn {
    height: 32px;
    padding: 0 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
    border: 1px solid #e8eaec;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(28, 31, 35, 0.1);
    }
    
    i {
      margin-right: 4px;
      vertical-align: middle;
      font-size: 18px; /* 放大图标 */
      margin: 0; /* 移除图标右边距 */
    }
  }
}

/* // 新增下拉菜单层级调整 */
.ivu-select-dropdown {
  position: fixed !important;  /* 改为fixed定位*/
  z-index: 9999 !important; 
  transform: translateZ(0);
  will-change: transform; 
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
/* 新增响应式处理 */
@media (max-width: 768px) {
  .main-layout {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .snippet-panel {
    height: 300px;
    margin-bottom: 20px;
  }
}
html, body {
  height: 100%;
}
.pdf-export {
    position: absolute;
    left: -9999px;
    width: 210mm !important; /* A4纸宽度 */
    padding: 20mm !important;
    background: white !important;
    color: #000 !important;
}

.dark-theme .pdf-export {
    background: #fff !important;
    color: #000 !important;
}
</style>