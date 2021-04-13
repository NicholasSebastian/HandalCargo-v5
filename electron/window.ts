import { BrowserWindow } from 'electron'
import '@babel/polyfill'
import * as path from 'path'
import * as url from 'url'

import { connectionInstance } from './main'

const loginWindowSize = { width: 550, height: 400 }
const windowSize = { width: 1360, height: 720, minWidth: 1340, minHeight: 640 }

class Window {
  window: Electron.BrowserWindow | null

  constructor () {
    this.window = new BrowserWindow({
      width: loginWindowSize.width,
      height: loginWindowSize.height,
      resizable: false,
      icon: '../src/assets/images/icon.png',
      backgroundColor: '#FFF',
      webPreferences: {
        nodeIntegration: true
      },
      show: false
    })
    this.loadContent()
    this.window.removeMenu()
    this.window.once('ready-to-show', () => {
      this.window?.show()
      if (process.env.NODE_ENV === 'development') {
        this.window?.webContents.openDevTools()
      }
    })
    this.window.once('closed', () => {
      connectionInstance.connection?.end()
      this.window = null
    })
  }

  public onLogin (): void {
    this.window?.setSize(windowSize.width, windowSize.height)
    this.window?.setMinimumSize(windowSize.minWidth, windowSize.minHeight) // this is bugged. min size is 0, 0 for some reason...
    this.window?.setResizable(true)
    this.window?.center()
  }

  public onLogout (): void {
    this.window?.close()
  }

  private loadContent () {
    if (process.env.NODE_ENV === 'development') {
      this.window?.loadURL('http://localhost:4000')
    } else {
      this.window?.loadURL(
        url.format({
          pathname: path.join(__dirname, 'renderer/index.html'),
          protocol: 'file:',
          slashes: true
        })
      )
    }
  }
}

export default Window
