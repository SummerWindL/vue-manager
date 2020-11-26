import { CommonRouter } from '@/v1/bizrouters/RouterConfigCommon.js' 
const Home = () =>
    import('@/v1/pages/home/Home');
const BlankHome = () =>
    import('@/v1/page/home/BlankHome');
const Main = () =>
    import('@/v1/pages/sysinit/MainFramework');


//根路由
export default rootRouter = {
    path: '/',
    name: 'rootRouter',
    redirect: '/login',
    component: Main,
    children: [
        { path: 'home', title: '首页', name: 'Home', component: Home },
        { path: 'blank', title: '首页', name: 'BlankHome', component: BlankHome }
    ]
};

export const routers = [
    rootRouter,
    ...CommonRouter
]
