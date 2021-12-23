import { AppDataInstance } from '@/views/GameList/instance'
import React, { useRef, useState } from 'react'
import Message from '../Message'
import style from './index.module.scss'
interface Props {
  app: AppDataInstance | null
  onCancel: () => void
  onSave: (app: AppDataInstance) => void
}

export default function Attribute(props: Props) {
  if (!props.app) return null
  const app = { ...props.app }
  const [state, setState] = useState({
    app,
  })
  const dirFileRef = useRef<HTMLInputElement>(null)
  const iconFileRef = useRef<HTMLInputElement>(null)
  /**input输入绑定 */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.dataset.key as keyof AppDataInstance
    const value = e.target.value
    if (Reflect.has(app, key)) {
      setState({
        app: {
          ...state.app,
          [key]: value,
        },
      })
    }
  }
  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filelist = e.target.files
    const file = filelist?.[0]
    if (file) {
      if (/(.png|.jpg|.jpeg|.ico)$/.test(file.name)) {
        window.Main.getImageData(file.path).then(icon => {
          setState({
            app: {
              ...app,
              icon: icon,
            },
          })
        })
      } else {
        window.Main.getFileIcon(file.path).then(icon => {
          setState({
            app: {
              ...app,
              icon: icon,
            },
          })
        })
      }
    }
  }
  /**修改目录 */
  const handleDirChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filelist = e.target.files
    const file = filelist?.[0]
    if (file) {
      setState({
        app: {
          ...state.app,
          dir: file.path.replace(file.name, ''),
        },
      })
    }
  }
  /**保存 */
  const handleSave = () => {
    if (!state.app.name) {
      return Message.error('游戏名称不能为空')
    } else if (!state.app.modDir) {
      return Message.error('mod文件夹名称不能为空')
    }
    props.onSave(state.app)
  }
  return (
    <div className={style.Attribute}>
      <div className={style.AttributeBox}>
        <div className={style.attrItem}>
          <div>游戏名: </div>
          <input
            type="text"
            value={state.app?.name}
            onChange={handleInputChange}
            data-key="name"
          />
          <span style={{ color: 'red' }}>*</span>
        </div>
        <div className={style.attrItem}>
          <div>图标: </div>
          <div>
            <img
              src={state.app?.icon}
              alt={state.app?.name}
              style={{ maxWidth: 50, maxHeight: 50 }}
            />
            <button
              style={{ marginLeft: 16, marginRight: 4 }}
              onClick={() => iconFileRef.current?.click()}
            >
              更换图标:{' '}
            </button>
            <span style={{ fontSize: 12 }}>选择图片或应用程序图标文件</span>
            <input type="file" ref={iconFileRef} onChange={handleIconChange} />
          </div>
        </div>
        <div className={style.attrItem}>
          <div>游戏目录: </div>
          <input type="text" value={state.app?.dir} readOnly />
          <button onClick={() => dirFileRef.current?.click()}>修改目录</button>
          <input type="file" ref={dirFileRef} onChange={handleDirChange} />
        </div>
        <div className={style.attrItem}>
          <div>Mod文件夹: </div>
          <input
            type="text"
            value={state.app?.modDir}
            onChange={handleInputChange}
            data-key="modDir"
          />
          <span style={{ color: 'red' }}>*</span>
        </div>
        <div className={style.buttonList}>
          <button onClick={handleSave}>保存</button>
          <button onClick={props.onCancel}> 取消</button>
        </div>
      </div>
    </div>
  )
}
