import base from './base'; // 导入接口域名列表
import axios from '@/request/http'; // 导入http中创建的axios实例
import qs from 'qs'; // 根据需求是否导入qs模块

const word2Pdf = {
    
    word2Pdf (params) {
      console.log('======>',params);
      return axios.get(`${base.baseURL}/wod2Pdf/downLoadFile?fileUrl=`+ this.filePath,params);
    }
    // 其他接口…………
  }
  
  export default word2Pdf;