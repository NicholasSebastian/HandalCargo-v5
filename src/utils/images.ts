import { remote } from 'electron';
const fs = remote.require('fs');

// https://stackoverflow.com/questions/11821096/what-is-the-difference-between-an-arraybuffer-and-a-blob#:~:text=The%20ArrayBuffer%20object%20is%20used,length%20raw%20binary%20data%20buffer.&text=A%20Blob%20object%20represents%20a,in%20a%20JavaScript%2Dnative%20format.
// https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer/12101012#:~:text=12%20Answers&text=Instances%20of%20Buffer%20are%20also%20instances%20of%20Uint8Array%20in%20node.&text=js%20has%20both%20ArrayBuffer%20as,a%20view%20and%20copy%20across.

// OPTION 1:
// Store the images in the database as BLOB. https://stackoverflow.com/questions/25951251/nodejs-mysql-insert-blob

// OPTION 2:
// Just store the images in the database as Base64. Something like https://www.youtube.com/watch?v=9Rhsb3GU2Iw

// TODO: fix this... images are inserted as Buffer but retrieved as Uint8Array and the data does not match... 

function urlFromPath(imagePath: string) {
  const imageBuffer = fs.readFileSync(imagePath);
  const image64 = imageBuffer.toString('base64');
  const imageUrl = `data:image/png;base64,${image64}`;
  return imageUrl;
}

function bufferFromPath(path: string) {
  const buffer = fs.readFileSync(path);
  return buffer;
}

function urlFromBuffer(data: any) {
  const buffer = Buffer.from(data, 'binary');
  // const typedArray = new Uint8Array(arrayBuffer.buffer);
  // const imageString = String.fromCharCode.apply(null, typedArray as never);
  // const image64 = btoa(imageString);
  // const imageUrl = `data:image/png;base64,${image64}`;

  // const blob = new Blob([arrayBuffer.buffer]);
  // const url = URL.createObjectURL(blob);
  
  console.log('From ArrayBuffer:', data);
  console.log('To Buffer:', buffer);
  // console.log('Created url:', imageUrl);

  return "";
}

export { urlFromPath, bufferFromPath, urlFromBuffer };
