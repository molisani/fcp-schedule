import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './app/';

import { FCPModule } from './app/fcp.module';



// const remote = window['require'] ? (<any>window).require('electron').remote : null;
//
// let rightClick: { x: number, y: number } = null;
//
// const menu = new remote.Menu();
// const menuItem = new remote.MenuItem({
//   label: 'Inspect Element',
//   click: () => {
//     remote.getCurrentWindow().webContents.inspectElement(rightClick.x, rightClick.y);
//   }
// });
// menu.append(menuItem);
//
// window.addEventListener('contextmenu', (e) => {
//   e.preventDefault();
//   rightClick = { x: e.x, y: e.y };
//   menu.popup(remote.getCurrentWindow());
// })


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(FCPModule);
