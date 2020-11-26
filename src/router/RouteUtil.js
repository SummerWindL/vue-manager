export default {
    toDefaultPage: function(routers,name,route,next){
        let len = routers.length;
        let i=0;
        let notHandle = true;
        while(i < len){
           if(routers[i].name && routers[i].children && routers[i].redirect === undefined){
              route.replace({
                  name: routers[i].children[0].name
              });
              notHandle = false;
              next();
              break;
           }
           i++;
        }
        if(notHandle){
            next();
        }
    }
}