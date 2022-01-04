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
    if (target && /(.zip)$/.test(targetName)) {
      const reactivePath = nodePath.join(
        window.Main.getReactivePath() + `/mods/${state.gameData.name}/`
      )
      window.Main.copyFile(target.path, reactivePath, target.name).then(() => {
        const path = nodePath.join(reactivePath, target.name)
        const information = nodePath.parse(path)
        const files = window.Main.readZipFile(path).map(item => ({
          entryName: item.entryName,
          isDirectory: item.isDirectory,
        }))
        const result = {
          ...information,
          path,
          date: dayjs().format('YYYY-MM-DD HH:mm'),
          isinstall: false,
          files: files,
        }
        const dataset = state.modData[state.uid] || {}
        if (dataset[result.name]) {
          if (dataset[result.name].isinstall) {
            return alert('文件已存在')
          } else if (!confirm('文件已存在，确定要覆盖吗？')) {
            saveFileState(result)
          }
        } else {
          saveFileState(result)
        }
      })
    } else {
      alert('文件不合法')
      e.target.files = null
    }
  }
  /**安装文件 */
  const installModFile = (target: Base.ModDataInstance) => {
    const modPath = nodePath.join(state.gameData.dir, state.gameData.modDir)
    window.Main.unzipFile(target.path, modPath).then(async () => {
      const result = { ...target, isinstall: true }
      await saveFileState(result)
      Message.success('安装成功')
    })
  }

  /**移除已安装的文件 */
  const uninstallModFile = async (target: Base.ModDataInstance) => {
    const directorys: string[] = []
    for (const item of target.files) {
      if (directorys.some(dir => item.entryName.startsWith(dir))) {
        continue
      }
      const rootPath = nodePath.join(
        state.gameData.dir,
        state.gameData.modDir,
        item.entryName
      )
      if (item.isDirectory) {
        directorys.push(item.entryName)
        await window.Main.deleteDir(rootPath)
      } else {
        await window.Main.deleteFile(rootPath)
      }
    }
    const result = { ...target, isinstall: false }
    saveFileState(result).then(() => {
      Message.success('卸载成功')
    })
  }
  /**删除mod文件 */
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
  const saveFileState = (data: Base.ModDataInstance) => {
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
                          onClick={() => uninstallModFile(item)}
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
