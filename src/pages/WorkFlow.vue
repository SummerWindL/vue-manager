<template>
  <div class="n8n-container">
    <iframe 
      src="http://localhost:5678/"
      frameborder="0"
      style="width: 100%; height: calc(100vh - 60px)"
    ></iframe>
  </div>
</template>

<script>
export default {
  name: 'WorkFlow',
  mounted() {
    // 移除跨域消息传递（直接通过代理访问）
    const iframe = document.querySelector('iframe');
    iframe.onload = () => {
      console.log('n8n loaded');
    };
  },
  created() {
    console.log('n8n created'); 
  }
};
</script>