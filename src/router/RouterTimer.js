//路由跳转后会自动清除的timer
const timeMap = new Map()

const innerClearTimer = function (timerArray) {
    if(timerArray && timerArray.length > 0){
        //遍历timer数组，清掉定时器
        for(var i=0;i<timerArray.length;i++){
            window.clearInterval(timerArray[i])
        }
    }
}

export default {
    setInterval (router, fun, ms) {
        var routeName = route.name
        //取出router对应的timer数组
        var timerArray = timeMap.get(routeName)
        if (!timerArray) {
            timerArray = []
        }
        var timer = window.setInterval(fun , ms)
        timerArray.push(timer)
        timeMap.set(routeName,timerArray)
    },
    clearTimer (route) {
        var routeName = route.name
        //取出route对应的timer数组
        var timer = timeMap.get(routeName)
        innerClearTimer(timerArray)
        //移除route
        timeMap.delete(routeName)
    },
    clearAllTimer () {
        //停掉所有timer，清空map
        timeMap.forEach((value, key , map) => {
            innerClearTimer(value)
        });
        timeMap.clear()
    }
}