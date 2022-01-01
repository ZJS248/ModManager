import { createUid } from '@/utils/util'
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import style from './index.module.scss'
import dayjs from 'dayjs'
import Message from '@/components/Message'
interface Props {}
const nodePath = window.Main.path
export default function (props: Props) {
  const navigate = useNavigate()
  const params = useParams()
  const [state, setState] = useState({
    uid: '' as string,
    gameData: {} as Base.AppDataInstance,
    modData: {} as Record<string, Record<string, Base.ModDataInstance>>,
  })
  /**添加zip文件至本地目录 */
  const handleZipFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target.files?.[0]
    const targetName = target?.name || ''
    if (target && /(.tar|.zip|.tgz|.gzip)$/.test(targetName)) {
      const reactivePath = nodePath.join(
        window.Main.getReactivePath() + `/mods/${state.gameData.name}/`
      )
      window.Main.copyFile(target.path, reactivePath, target.name).then(() => {
        const path = nodePath.join(reactivePath, target.name)
        const information = nodePath.parse(path)
        saveFileState({
          ...information,
          path,
          date: dayjs().format('YYYY-MM-DD HH:mm'),
          isinstall: false,
        })
      })
    } else {
      alert('文件不合法')
      e.target.files = null
    }
  }
  const installModFile = (target: Base.ModDataInstance) => {
    const modPath = nodePath.join(
      state.gameData.dir,
      state.gameData.modDir,
      './test'
    )
    window.Main.unzipFile(target.path, modPath).then(async () => {
      const result = { ...target, isinstall: true }
      await saveFileState(result, false)
      Message.success('安装成功')
    })
  }

  const removeModFile = (target: Base.ModDataInstance) => {
    window.Main.readZipFile(target.path)
  }

  const deleteModFile = async (target: Base.ModDataInstance) => {
    if (target.isinstall) return false
    if (confirm(`删除文件不可恢复，确定要删除${target.name}吗？`)) {
      const modData = state.modData
      delete modData[state.uid][target.name]
      setState({
        ...state,
        modData,
      })
      await window.Store.setStore('modData', modData)
      window.Main.deleteFile(target.path)
        .then(() => Message.success('删除成功'))
        .catch(e => {
          Message.error('删除失败' + e)
        })
    }
  }
  /**保存mod文件树 */
  const saveFileState = (data: Base.ModDataInstance, showConfirm = true) => {
    const isExist = (state.modData[state.uid] || {})[data.name]
    if (isExist && showConfirm) {
      if (isExist.isinstall) {
        return alert('请卸载mod文件后再操作')
      }
      if (!confirm('文件已存在，确定要覆盖吗？')) {
        return Promise.resolve(null)
      }
    }
    const result = { ...(state.modData[state.uid] || {}), [data.name]: data }
    const modData = {
      ...state.modData,
      [state.uid]: result,
    }
    setState({
      ...state,
      modData,
    })
    return window.Store.setStore('modData', modData)
  }
  useEffect(() => {
    const uid = params.id
    if (uid) {
      window.Store.getStoreList(['appData', 'modData']).then(res => {
        setState({
          ...state,
          uid,
          gameData: res[0][uid],
          modData: res[1] || { [uid]: {} },
        })
      })
    }
  }, [])
  return (
    <>
      <div className={style.ModList}>
        <div className={style.toolBar}>
          <div onClick={() => navigate(-1)} className={style.back}>
            &lt;-返回
          </div>
          <div className={style.add}>
            <div>添加文件</div>
            <input type="file" onChange={handleZipFile} />
          </div>
        </div>
        <div className={style.Main}>
          <div className={style.table}>
            <div className={style.thead}>
              <div className={style.tr}>
                <div className={style.th} style={{ flex: 0.2 }}>
                  序号
                </div>
                <div className={style.th} style={{ flex: 1 }}>
                  名称
                </div>
                <div className={style.th} style={{ flex: 1 }}>
                  分类
                </div>
                <div className={style.th} style={{ flex: 0.8 }}>
                  创建日期
                </div>
                <div className={style.th} style={{ flex: 1 }}>
                  备注
                </div>
                <div className={style.th} style={{ flex: 1 }}>
                  操作
                </div>
              </div>
            </div>
            <div className={style.tbody}>
              {Object.keys(state.modData[state.uid] || {}).map((key, index) => {
                const item = state.modData[state.uid][key]
                return (
                  <div className={style.tr} key={key}>
                    <div className={style.td} style={{ flex: 0.2 }}>
                      {index + 1}
                    </div>
                    <div className={style.td} style={{ flex: 1 }}>
                      {item.name}
                    </div>
                    <div className={style.td} style={{ flex: 1 }}>
                      {item.category}
                    </div>
                    <div className={style.td} style={{ flex: 0.8 }}>
                      {item.date}
                    </div>
                    <div className={style.td} style={{ flex: 1 }}>
                      {item.remarks}
                    </div>
                    <div className={style.td} style={{ flex: 1 }}>
                      {item.isinstall ? (
                        <button
                          className={style.warn}
                          onClick={() => removeModFile(item)}
                        >
                          卸载
                        </button>
                      ) : (
                        <button
                          className={style.primary}
                          onClick={() => installModFile(item)}
                        >
                          安装
                        </button>
                      )}
                      <button
                        className={
                          item.isinstall
                            ? `${style.danger} ${style.disabled}`
                            : style.danger
                        }
                        onClick={() => deleteModFile(item)}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
