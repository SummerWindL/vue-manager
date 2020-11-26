export default {
    getObject (key) {
        var obj = localStorage.getItem(key)
        if(obj){
            try {
                obj = JSON.parse(obj)
            }catch {
                console.log(e)
            }
        }
        return obj
    },
    setObj (key, obj) {
        localStorage.setItem(key,JSON.stringify(obj))
    },
    removeObj (key) {
        localStorage.removeItem(key)
    },
    removeByKeyMap(keyMap) { 
        for (var key in keyMap) { 
            this.removeObj(keyMap[key])
        }
    },
    setStr(key,str) { 
        localStorage.setItem(key,str)
    },
    getStr(str) {
        var obj = localStorage.getItem(str)
        return obj
    }

}