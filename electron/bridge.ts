import { contextBridge, ipcRenderer, NativeImage } from 'electron'
import storeApi from './bridge/store'
import fs from 'fs/promises'
import compressing from 'compressing'
import path from 'path'
import { createReadStream, createWriteStream, WriteStream } from 'original-fs'
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
      case 'zip':
      case 'tgz':
      case 'tar':
      case 'gzip': {
        try {
          await fs.access(outDir)
        } catch {
          await fs.mkdir(outDir, { recursive: true })
        }
        return compressing[ext].uncompress(target, outDir)
      }
      default:
        throw new Error('不支持的文件类型')
    }
  },
  readZipFile: (target: string) => {
    const ext = path.parse(target).ext.slice(1) //文件后缀名
    async function onEntry(
      header: compressing.streamHeader,
      stream: WriteStream,
      next: () => void
    ) {
      stream.on('end', next)
      if (header.type === 'file') {
        console.log(header)
        const dest = path.resolve(__dirname, '../../../public')
        const infomation = path.parse(header.name)
        await fs.mkdir(path.join(dest, infomation.dir), { recursive: true })
        stream.pipe(createWriteStream(path.join(dest, header.name)))
      } else {
        console.log(header)
      }
    }
    switch (ext) {
      // case 'rar':
      //   return rar.decompress(target, outDir)
      case 'zip':
      case 'tgz':
      case 'tar': {
        return new Promise((resolve, reject) => {
          const stream = new compressing[ext].UncompressStream({
            source: target,
          })
            .on('error', err => reject(err))
            .on('finish', () => {
              console.log('close')
            }) // uncompressing is done
            .on('entry', onEntry)
            .on('end', data => {
              console.log('end')
            })
        })
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
  deleteFile: (path: string) => {
    return fs
      .access(path)
      .then(() => fs.unlink(path))
      .catch(() => {
        throw new Error('文件不存在')
      })
  },
  path: path,
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
