import { app, ipcMain } from 'electron'
import dotenv from 'dotenv'

import Window from './window'
import Connection from './database'
import { customEncrypt, customDecrypt } from './encryption'

export let windowInstance: Window
export let connectionInstance: Connection

dotenv.config()
app.on('ready', () => {
  windowInstance = new Window()

  // encryption functionality
  ipcMain.on('encrypt', (event, message) => { event.returnValue = customEncrypt(message) })
  ipcMain.on('decrypt', (event, encryptedObject) => { event.returnValue = customDecrypt(encryptedObject) })

  ipcMain.on('connect', (event, connectionSettings) => {
    connectionInstance = new Connection(event, connectionSettings)

    // login/logout functionality
    ipcMain.on('login', (event, username, password) => connectionInstance.onLogin(event, username, password))
    ipcMain.once('logout', () => windowInstance.onLogout())

    // database query functionality
    ipcMain.on('query', (event, query, replyKey) => connectionInstance.query(event, query, replyKey));
    ipcMain.on('queryValues', (event, query, values, replyKey) => connectionInstance.queryWithValues(event, query, values, replyKey))
  })
})

app.allowRendererProcessReuse = true
