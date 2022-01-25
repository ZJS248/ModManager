import { contextBridge, ipcRenderer, NativeImage } from 'electron'
import storeApi from './bridge/store'
import fs from 'fs/promises'
import compressing from 'compressing'
import path from 'path'

import AdmZip from 'adm-zip-iconv'
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
   *  解压文件至目录
   * @param path 目标文件
   * @param type 文件类型
   * @param outDir 输出目录
   * @returns
   */
  unzipFile: async (target: string, outDir: string): Promise<unknown> => {
    const ext = path.parse(target).ext.slice(1) //文件后缀名
    switch (ext) {
      // case 'rar':
      //   return rar.decompress(target, outDir)
      case 'zip': {
        try {
          await fs.access(outDir)
        } catch {
          await fs.mkdir(outDir, { recursive: true })
        }
        return compressing[ext].uncompress(target, outDir, {
          zipFileNameEncoding: 'gbk',
        })
      }
      default:
        throw new Error('不支持的文件类型')
    }
  },
  readZipFile: (target: string) => {
    const ext = path.parse(target).ext.slice(1) //文件后缀名
    switch (ext) {
      case 'zip': {
        return new AdmZip(target, 'GBK').getEntries()
      }
      default:
        throw new Error('不支持的文件类型')
    }
  },
  /**获取当前文件相对路径 */
  getReactivePath: () => {
    return path.resolve(__dirname, '../../../')
  },
  /**复制文件 */
  copyFile: async (target: string, outDir: string, filename: string) => {
    try {
      await fs.access(outDir)
    } catch {
      await fs.mkdir(outDir, { recursive: true })
    }
    await fs.copyFile(target, path.join(outDir, filename))
    // return fs.copyFile(target, path.join(outDir, filename))
  },
  /**删除文件 */
  deleteFile: (path: string) => {
    return fs
      .access(path)
      .then(() => fs.unlink(path))
      .catch(e => console.log(e))
  },
  /**递归删除文件夹 */
  deleteDir: (target: string) => {
    return fs
      .readdir(target)
      .then(async files => {
        for (const str of files) {
          const filePath = path.join(target, str)
          const stat = await fs.stat(filePath)
          if (stat.isDirectory()) {
            await api.deleteDir(filePath)
          } else {
            await fs.unlink(filePath)
          }
        }
        await fs.rmdir(target)
      })
      .catch(e => {
        console.log(e)
      })
  },
  path: path,
  /**
   * Provide an easier way to listen to events
   */
  on: (channel: string, callback: Function) => {
    ipcRenderer.on(channel, (_, data) => callback(data))
  },
  showGameContextMenu: (channel: string, param: any) => {
    ipcRenderer.send(channel, param)
    return new Promise(resolve => {
      ipcRenderer.once('game-context-menu-remove', (event, key: string) => {
        resolve({ type: 'remove', key })
      })
      ipcRenderer.once('game-context-menu-close', () => {
        console.log('will close')
        resolve({ type: 'close' })
      })
    })
  },
}

contextBridge.exposeInMainWorld('Main', api)
contextBridge.exposeInMainWorld('Store', storeApi)

export { storeApi, api }
