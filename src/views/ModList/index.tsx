import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import style from './index.module.scss'
import { AppDataInstance } from '@/views/GameList/instance'
interface Props {}
export default function (props: Props) {
  const navigate = useNavigate()
  const params = useParams()
  const [state, setState] = useState({
    gameData: {} as AppDataInstance,
  })
  const handleZipFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target.files?.[0]
    if (target) {
      const path = target.path
      const reactivePath = window.Main.getReactivePath()
      window.Main.unzipFile(path, reactivePath + './Mod')
    } else {
      alert('文件不合法')
    }
  }
  useEffect(() => {
    const uid = params.id
    if (uid) {
      window.Store.getStore('appData').then(res => {
        setState({
          gameData: res[uid],
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
        <div className={style.Main}></div>
      </div>
    </>
  )
}
