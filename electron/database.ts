import { ipcMain, dialog } from 'electron'
import mariadb from 'mariadb'
import '@babel/polyfill'

import { windowInstance } from './main'
import { customDecrypt } from './encryption'

const DB_PING_INTERVAL = 60000

class Connection {
  connection: mariadb.Connection | undefined

  constructor (event: Electron.IpcMainEvent, connectionSettings: object) {
    console.log('Establishing connection...')
    mariadb.createConnection(connectionSettings)
      .then(connection => {
        this.connection = connection
        this.connection.on('error', Connection.handleConnectionError)
        this.createConnectionHeartbeat()
        console.log('Connection established.')
        event.reply('connected', false)
      })
      .catch(() => {
        console.log('Unable to establish connection.');
        event.reply('connected', true)
      })
  }

  public onLogin (event: Electron.IpcMainEvent, username: string, password: string): void {
    this.connection?.query('SELECT `pwd`, `pwd_iv`, `pwd_salt` FROM `staff` WHERE `staffid` = ?', [username])
      .then(async data => {
        if (Object.entries(data).length > 1) {
          const encryptedTruePassword = {
            cipherText: data[0].pwd,
            initializeVector: data[0].pwd_iv,
            salt: data[0].pwd_salt
          }
          const truePassword = customDecrypt(encryptedTruePassword)
          if (truePassword === password) {
            ipcMain.removeAllListeners('login')
            const profileInfo =
              await this.connection?.query('\
                SELECT * FROM `staff` \
                LEFT JOIN `staffgroup` \
                ON `staff`.`groupcode` = `staffgroup`.`stfgrcode` \
                WHERE `staffid` = ?',
                [username]
              )
            event.reply('login-success', profileInfo[0])
            windowInstance.onLogin()
          }
          else {
            event.reply('login-failed', 'Invalid Password')
          }
        } else {
          event.reply('login-failed', 'Invalid Username')
        }
      })
      .catch(Connection.handleConnectionError)
  }

  public query (event: Electron.IpcMainEvent, query: string, replyKey: string): void {
    console.log(`Querying: ${query}`);
    if (this.connection?.isValid()) {
      this.connection.query(query)
        .then((data: Array<any>) => {
          event.reply(replyKey, data)
        })
        .catch(error => event.reply('prompt', error.message, replyKey))
    } else {
      Connection.handleConnectionError()
    }
  }

  public queryWithValues (event: Electron.IpcMainEvent, query: string, values: Array<string>, replyKey: string): void {
    console.log(`Querying: ${query}`);
    if (this.connection?.isValid()) {
      this.connection.query(query, values)
        .then((data: Array<any>) => {
          event.reply(replyKey, data)
        })
        .catch(error => event.reply('prompt', error.message, replyKey))
    } else {
      Connection.handleConnectionError()
    }
  }

  private createConnectionHeartbeat () {
    setInterval(() => {
      console.log('Pinging the database server.')
      this.connection?.query('SELECT 1')
        .catch(Connection.handleConnectionError)
    }, DB_PING_INTERVAL)
  }

  private static handleConnectionError (error?: mariadb.SqlError) {
    if (error) {
      if (error.code === 'ECONNREFUSED') {
        dialog.showErrorBox('Connection Refused', 'There was a problem connecting to the database server.')
      } else {
        dialog.showErrorBox('Fatal Error occured', `${error.code}: ${error.message}`)
      }
    } else {
      dialog.showErrorBox('Connection ended', 'Connection with database unexpectedly is no longer valid.')
    }
    windowInstance.window?.close()
  }
}

export default Connection
