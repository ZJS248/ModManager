import { ipcMain, app, Menu, dialog } from 'electron'
import Store from 'electron-store'
const store = new Store() as Store<{
  appData: Record<string, Base.AppDataInstance>
  ModData: Record<string, Base.ModDataInstance>
}>

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
ipcMain.on('getStoreList', (event, channelList: string[]) => {
  const arr: unknown[] = []
  channelList.forEach(channel => {
    arr.push(store.get(channel))
  })
  event.reply('getStoreList', arr)
})
ipcMain.on('game-context-menu', (event, key: string) => {
  const data = store.get('appData')
  console.log(data)
  const menu = Menu.buildFromTemplate([
    {
      label: '删除',
      click: () => {
        dialog
          .showMessageBox({
            type: 'question',
            message: '确定要删除吗',
            buttons: ['确定', '取消'],
          })
          .then(res => {
            if (res.response === 0) {
              event.reply(`game-context-menu-close`, key)
            }
          })
      },
    },
    {
      label: '属性',
      click: () => {
        dialog.showSaveDialog({
          title: data[key].name,
        })
      },
    },
  ])
  menu.popup()
})
