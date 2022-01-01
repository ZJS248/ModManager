import { ipcRenderer } from 'electron'
const storeApi = {
  /**
   * Here you can expose functions to the renderer process
   * so they can interact with the main (electron) side
   * without security problems.
   *
   * The function below can accessed using `window.Main.sendMessage`
   */

  setStore: (channel: string, data: any): Promise<any> => {
    return new Promise(resolve => {
      ipcRenderer.send('setStore', channel, data)
      ipcRenderer.once('setStore', (_e, data) => {
        resolve(data)
      })
    })
  },
  getStore: (channel: string): Promise<any> => {
    return new Promise(resolve => {
      ipcRenderer.send('getStore', channel)
      ipcRenderer.once('getStore', (_e, data) => {
        resolve(data)
      })
    })
  },
  getStoreList: (channelList: string[]): Promise<any[]> => {
    return new Promise(resolve => {
      ipcRenderer.send('getStoreList', channelList)
      ipcRenderer.once('getStoreList', (_e, data) => {
        resolve(data)
      })
    })
  },
}
export default storeApi
