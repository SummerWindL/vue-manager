<template>
    <div></div>
</template>
<script>
    export default {  
        name: 'Refesh',  
        // refresh.vue
        beforeRouteEnter (to, from, next) {
            next(vm => {            
                vm.$router.replace(from.fullPath)        
            })    
        }
    }
</script>