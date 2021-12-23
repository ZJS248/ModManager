import { ipcMain, app } from 'electron'
import Store from 'electron-store'
const store = new Store()

ipcMain.on('getFileIcon', (event, path) => {
  return app.getFileIcon(path).then(res => {
    event.reply('getFileIcon', res)
  })
})

ipcMain.on('setStore', (event, channel: string, data: any) => {
  store.set(channel, data)
  event.reply('setStore', store.get(channel))
})
ipcMain.on('getStore', (event, channel: string) => {
  event.reply('getStore', store.get(channel))
})
