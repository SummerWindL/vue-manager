/**
 * @author: https://juejin.cn/post/6844903652881072141
 * article模块接口列表
 */

import base from './base'; // 导入接口域名列表
import axios from '@/request/http'; // 导入http中创建的axios实例
import qs from 'qs'; // 根据需求是否导入qs模块

const login = {
  // post提交
  login (params) {
    console.log('======>',params);
    return axios.post(`${base.api_url}/cmd_10010?factoryid=zav6f0t3w6fwz9u85remvqxkduo99tjj&factorysecretkey=3fpjfimcp2iybd6h4l30c1kpvjzfcipg`, params);
  }
  // 其他接口…………
}

export default login;
