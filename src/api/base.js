/**
 * 接口域名的管理
 */
const jettyPort = "16089";
const tomcatPort = "8071";
const base = {
    api_url: `http://localhost:`+jettyPort+`/aixapiplatform/api/v1/client`,
    tomcat_url: `http://localhost:`+tomcatPort,
    bd: 'http://xxxxx22222.com/api',
    baseURL: "/api",
    wod2Pdf:  "/wod2Pdf"
}

export default base;
