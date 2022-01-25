import { ipcMain, app, Tray, Menu, dialog, shell } from 'electron'
import type { MenuItem, MenuItemConstructorOptions } from 'electron'
const template: (MenuItemConstructorOptions | MenuItem)[] = [
  {
    label: '关于', // macOS下第一个标签是应用程序名字，此处设置无效
    submenu: [
      {
        label: '项目地址',
        submenu: [
          {
            label: 'github',
            click: () =>
              shell.openExternal('https://github.com/ZJS248/ModManager'),
          },
        ],
      },
      {
        label: '检查更新',
        click: () =>
          dialog.showMessageBox({
            message: '已经是最新版本',
          }),
      },
      {
        label: 'devTool',
        role: 'toggleDevTools',
      },
    ],
  },
]
// 步骤三
const menu = Menu.buildFromTemplate(template)

// 步骤四
Menu.setApplicationMenu(menu)
