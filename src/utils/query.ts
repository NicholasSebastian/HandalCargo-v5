import { ipcRenderer } from 'electron';
import { v4 as generateKey } from 'uuid';

function isError (obj: any) {
  const isError = obj instanceof Error;
  const likeError = obj && obj.stack && obj.message;
  return isError || likeError;
}

function query (query: string, values: Array<any>) {
  return new Promise((resolve, reject) => {
    const queryKey = generateKey();
    ipcRenderer.once(queryKey, (event, data) => {
      if (isError(data)) {
        reject(data as Error);
      }
      resolve(data);
    });
    ipcRenderer.send('queryValues', query, values, queryKey);
  });
}

function simpleQuery (query: string) {
  return new Promise((resolve, reject) => {
    const queryKey = generateKey();
    ipcRenderer.once(queryKey, (event, data) => {
      if (isError(data)) {
        reject(data as Error);
      }
      resolve(data);
    });
    ipcRenderer.send('query', query, queryKey);
  });
}

export { query, simpleQuery };