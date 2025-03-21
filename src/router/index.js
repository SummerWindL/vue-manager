import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/Home'
import Dashboard from '@/pages/Dashboard'
import BasicTable from '@/pages/BasicTable'
import EditableTable from '@/pages/EditableTable'
import Widget from '@/pages/Widget'
import Panels from '@/pages/Panels'
import Editor from '@/pages/Editor'
import ImageList from '@/pages/ImageList'
import Charts from '@/pages/Charts'
import Login from '@/pages/Login'
import LockScreen from '@/pages/LockScreen'
import Loading from '@/pages/Loading'
import Word2Pdf from '@/pages/Word2Pdf'
import PuzzleGame from '@/pages/PuzzleGame'
import WorkFlow from '@/pages/WorkFlow'
import Resume from '@/pages/Resume'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Home,
      children: [
        {
          path: '/',
          name: 'Dashboard',
          component: Dashboard
        },
        {
          path: 'word2pdf',
          name: 'Word2Pdf',
          component: Word2Pdf
        },
        {
          path: 'puzzleGame',
          name: 'PuzzleGame',
          component: PuzzleGame
        },
        {
          path: 'workFlow',
          name: 'WorkFlow',
          component: WorkFlow
        },
        {
          path: 'resume',
          name: 'Resume',
          component: Resume
        },
        {
          path: 'widget',
          name: 'Widget',
          component: Widget
        },
        {
          path: 'panels',
          name: 'Panels',
          component: Panels
        },
        {
          path: 'editor',
          name: 'Editor',
          component: Editor
        },
        {
          path: 'imagelist',
          name: 'ImageList',
          component: ImageList
        },
        {
          path: 'basic-table',
          name: 'BasicTable',
          component: BasicTable
        },
        {
          path: 'editable-table',
          name: 'EditableTable',
          component: EditableTable
        },
        {
          path: 'charts',
          name: 'Charts',
          component: Charts
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      components: {
        blank: Login
      }
    },
    {
      path: '/lockscreen',
      name: 'Lockscreen',
      components: {
        blank: LockScreen
      }
    },
    {
      path: '/loading',
      name: 'Loading',
      components: {
        blank: Loading
      }
    }
  ]
})
