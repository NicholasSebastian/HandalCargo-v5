import React from 'react';
import { render } from 'react-dom';
import 'antd/dist/antd.css';

import Authentication from './components/Authentication';

document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', event => event.preventDefault());

const mainElement = document.createElement('div');
mainElement.setAttribute('id', 'root');
mainElement.style.width = '100vw';
mainElement.style.height = '100vh';
document.body.appendChild(mainElement);

render(<Authentication />, mainElement);
