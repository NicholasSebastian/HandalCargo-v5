import { remote, WebContentsPrintOptions } from 'electron';
const { BrowserWindow } = remote;

// alternatively use the native javascript 'window.print()' function.

var options: WebContentsPrintOptions = {
  silent: false,
  printBackground: true,
  color: false,
  margins: {
    marginType: 'printableArea'
  },
  landscape: false,
  pagesPerSheet: 1,
  collate: false,
  copies: 1
}

function print(values: any) {
  let window = new BrowserWindow({
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  });
  window.loadURL('https://www.google.com/');
  window.webContents.on('did-finish-load', () => {
    window.webContents.print(options, (success, error) => {
      if (!success) {
        throw error;
      }
    });
  });
}

export default print;