import style from './index.module.scss'
import React, { useEffect, useState } from 'react'
import { createUid } from '@/utils/util'
import GameContextMenu from '@/components/GameContextMenu'
import Attribute from '../../components/GameAttribute'
import Message from '@/components/Message'
import { useNavigate } from 'react-router-dom'
export default function GameIconApp() {
  const navigate = useNavigate()
  const [state, setState] = useState({
    AppData: {} as Record<string, Base.AppDataInstance | null>,
    /**菜单显示位置 */
    contextLeft: 0,
    contextTop: 0,
    /**是否显示右键菜单 */
    context: '',
    /**应用程序属性菜单 */
    attribute: false,
    app: null as Base.AppDataInstance | null,
  })
  /** 添加应用程序文件信息 */
  const handleDirPath = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filelist = e.target.files
    const file = filelist?.[0]
    if (!file || !/.exe$/.test(file.name)) {
      e.target.files = null
      return global.alert('所选文件不合法')
    }
    window.Main.getFileIcon(file.path)
      .then(icon => {
        const uid = createUid()
        const appName = file.name.replace(/.exe$/, '')
        const data = {
          uid,
          path: file.path,
          icon: icon,
          dir: file.path.replace(file.name, ''), //path.dirname(file.path),
          name: appName,
          modDir: 'Mod',
        }
        const AppData = { ...state.AppData, [uid]: data }
        setState({
          ...state,
          AppData,
        })
        window.Store.setStore('appData', AppData)
      })
      .catch(error => {
        e.target.value = ''
        Message.error(error)
      })
  }
  /**应用程序鼠标右键点击触发设置 */
  const handleAppRightClick = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault()
    const html = e.target as HTMLImageElement
    const key = html.dataset.uid
    if (key) {
      setState({
        ...state,
        contextLeft: e.clientX,
        contextTop: e.clientY,
        context: key || '',
        app: state.AppData[key],
      })
      window.Main.showGameContextMenu('game-context-menu', key).then(res => {
        console.log(res)
      })
    }
  }
  /** 添加按钮 */
  const AddButton = () => {
    return (
      <div className={style.AddButton}>
        <span>+</span>
        <input type="file" onChange={handleDirPath} />
      </div>
    )
  }
  /** 渲染应用程序列表 */
  const AppList = Object.keys(state.AppData || {}).map(key => {
    const app = state.AppData[key]
    if (!app) return null
    return (
      <div
        key={app.uid}
        className={style.GameIconDiv}
        data-uid={app.uid}
        onContextMenu={handleAppRightClick}
        onClick={() => navigate('/Mod/' + app.uid)}
      >
        <img
          src={app.icon}
          alt={app.name}
          className={style.GameIcon}
          data-uid={app.uid}
        />
        <div data-uid={app.uid}>{app.name}</div>
      </div>
    )
  })
  /**删除应用程序 */
  const removeConfirm = () => {
    const context = String(state.context)
    const file = state.AppData[context]
    hiddenMenu()
    setTimeout(() => {
      if (file && confirm(`你确定要移除${file.name}吗?`)) {
        if (confirm(`该操作不会卸载已经安装的mod文件，确定继续吗?`)) {
          const AppData = { ...state.AppData, [context]: null }
          setState({
            ...state,
            AppData: AppData,
            context: '',
            app: null,
          })
          window.Store.setStore('appData', AppData)
          const reactivePath = window.Main.path.join(
            window.Main.getReactivePath() + `/mods/${file.name}/`
          )
          window.Main.deleteDir(reactivePath)
        }
      }
    })
  }
  /**保存应用更改设置 */
  const saveAppChange = (app: Base.AppDataInstance) => {
    const AppData = {
      ...state.AppData,
      [app.uid]: app,
    }
    setState({
      ...state,
      AppData: AppData,
      context: '',
      app: null,
    })
    window.Store.setStore('appData', AppData)
  }
  /**展示应用属性弹框 */
  const showAttribute = () => {
    const key = state.context
    setState({
      ...state,
      app: state.AppData[key],
      attribute: true,
      context: '',
    })
  }
  /**隐藏应用程序菜单 */
  const hiddenMenu = () => {
    setState({
      ...state,
      context: '',
      app: null,
      attribute: false,
    })
  }
  /**
   * componentDidMount
   * 加载获取缓存应用程序信息
   */
  useEffect(() => {
    window.Store.getStore('appData').then(data => {
      setState({
        ...state,
        AppData: data,
      })
    })
  }, [])
  return (
    <div className={style.IconList}>
      {AppList}
      <AddButton />
      {state.context ? (
        <GameContextMenu
          left={state.contextLeft}
          top={state.contextTop}
          onRemove={removeConfirm}
          onAttribute={showAttribute}
          onBlur={hiddenMenu}
        />
      ) : null}
      {state.attribute ? (
        <Attribute
          app={state.app}
          onCancel={hiddenMenu}
          onSave={saveAppChange}
        />
      ) : null}
    </div>
  )
}
