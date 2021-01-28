import { app, ipcMain } from 'electron'

import Window from './window'
import Connection from './database'
import { customEncrypt, customDecrypt } from './encryption'

export let windowInstance: Window
export let connectionInstance: Connection

app.on('ready', () => {
  windowInstance = new Window()

  ipcMain.on('connect', (event) => {
    connectionInstance = new Connection(event)

    // login/logout functionality
    ipcMain.on('login', (event, username, password) => connectionInstance.onLogin(event, username, password))
    ipcMain.once('logout', () => windowInstance.onLogout())

    // database query functionality
    ipcMain.on('query', (event, query, replyKey) => connectionInstance.query(event, query, replyKey));
    ipcMain.on('queryValues', (event, query, values, replyKey) => connectionInstance.queryWithValues(event, query, values, replyKey))

    // encryption functionality
    ipcMain.on('encrypt', (event, message) => { event.returnValue = customEncrypt(message) })
    ipcMain.on('decrypt', (event, encryptedObject) => { event.returnValue = customDecrypt(encryptedObject) })
  })
})

app.allowRendererProcessReuse = true
