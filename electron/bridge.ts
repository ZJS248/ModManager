import { contextBridge, ipcRenderer, NativeImage } from 'electron'
import storeApi from './bridge/store'
import fs from 'fs/promises'
import compressing from 'compressing'
import rar from './utils/Rar'
import path from 'path'
const api = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sendMessage`
   */

  getFileIcon: (path: string): Promise<string> => {
    return new Promise(resolve => {
      ipcRenderer.send('getFileIcon', path)
      return ipcRenderer.once('getFileIcon', (_e, data: NativeImage) => {
        return resolve(data.toDataURL())
      })
    })
  },
  getImageData: (path: string): Promise<string> => {
    return fs.readFile(path).then(res => {
      const base64 = res.toString('base64')
      return 'data:image/png;base64,' + base64
    })
  },
  /**
   *
   * @param path 目标文件
   * @param type 文件类型
   * @param outDir 输出目录
   * @returns
   */
  unzipFile: (target: string, outDir: string): Promise<unknown> => {
    const ext = path.parse(target).ext.slice(1)
    console.log(ext)
    switch (ext) {
      case 'rar':
        return rar.decompress(target, outDir)
      case 'zip':
      case 'tgz':
      case 'tar':
      case 'gzip': {
        return compressing[ext].compressFile(target, outDir)
      }
      default:
        throw new Error('不支持的文件类型')
    }
  },
  getReactivePath: () => {
    return path.resolve(__dirname, '../')
  },
  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
}

contextBridge.exposeInMainWorld('Main', api)
contextBridge.exposeInMainWorld('Store', storeApi)

export { storeApi, api }
