<template>
  <div class="editor">
    <div class="vm-panel vm-margin">
      <div class="panel-heading">
        Preview
      </div>
      <div v-html="bindHtml">
        
      </div>
    </div>
    <VmEditor width="100%" class="vm-margin" @upload="onLoad">
    </VmEditor>
  </div>
</template>
<script>
// import VmEditor from '@/components/vm-editor/vm-editor'
import VmEditor from 'vm-editor'
import VmPanel from '@/components/vm-panel'
export default {
  name: 'editor',
  components: {
    VmEditor,
    VmPanel
  },
  data: function () {
    return {
      bindHtml: ''
    }
  },
  methods: {
    setHtml: function (data) {
      this.bindHtml = data
    },
    onLoad(id) {      
      console.log(id);
      this.$api.article.articleDetail(id, {        
          api: 123      
      }).then(res=> {
          // 执行某些操作      
      })    
    }
  }
}
</script>
