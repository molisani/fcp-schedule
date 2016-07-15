import { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog } from 'electron';

import * as fs from 'fs';
import * as path from 'path';

import { Schedule } from './app/schedule.view';

let mainWindow: Electron.BrowserWindow;
let save: Electron.MenuItem;
let currentFile: string;

function createMenu(): Electron.Menu {
  let main = new Menu();
  let fileMenu = new Menu();
  let newFile = new MenuItem({
    label: 'New',
    accelerator: 'CmdOrCtrl+N',
    click(item, focusedWindow) {
      let schedule: Schedule = {
        semester: 'New Semester',
        series: [],
      };
      mainWindow.webContents.send('open-schedule', schedule);
      save.enabled = false;
      currentFile = undefined;
    }
  });
  fileMenu.append(newFile);
  let open = new MenuItem({
    label: 'Open',
    accelerator: 'CmdOrCtrl+O',
    click(item, focusedWindow) {
      if (focusedWindow) {
        dialog.showOpenDialog(focusedWindow, {
          filters: [{ name: 'Schedules', extensions: ['json']}],
          properties: ['openFile'],
        }, (filenames: string[]) => {
          if (filenames && filenames[0]) {
            fs.readFile(filenames[0], 'utf8', (err, data) => {
              if (err) throw err;
              let schedule = JSON.parse(data);
              mainWindow.webContents.send('open-schedule', schedule);
              save.enabled = true;
              currentFile = filenames[0];
            });
          }
        });
      }
    }
  });
  fileMenu.append(open);
  save = new MenuItem({
    label: 'Save',
    enabled: false,
    accelerator: 'CmdOrCtrl+S',
    click(item, focusedWindow) {
      if (focusedWindow) {
        getCurrentSchedule((schedule) => {
          if (currentFile) {
            fs.writeFile(currentFile, JSON.stringify(schedule), 'utf8', (err) => {
              if (err) throw err;
            });
          }
        });
      }
    }
  });
  fileMenu.append(save);
  let saveAs = new MenuItem({
    label: 'Save As...',
    accelerator: 'CmdOrCtrl+Shift+S',
    click(item, focusedWindow) {
      if (focusedWindow) {
        getCurrentSchedule((schedule) => {
          dialog.showSaveDialog(focusedWindow, {
            filters: [{ name: 'Schedules', extensions: ['json']}],
          }, (filename: string) => {
            if (filename) {
              fs.writeFile(filename, JSON.stringify(schedule), 'utf8', (err) => {
                if (err) throw err;
              });
            }
          });
        });
      }
    }
  });
  fileMenu.append(saveAs);
  main.append(new MenuItem({
    label: 'Schedule',
    submenu: fileMenu
  }))
  return main;
}

function getCurrentSchedule(callback: (schedule: Schedule) => void) {
  if (mainWindow) {
    ipcMain.once('get-schedule', (event: any, schedule: Schedule) => {
      callback(schedule);
    });
    mainWindow.webContents.send('request-schedule');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({height: 650, width: 900, show: false});
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.setMenu(createMenu());
  mainWindow.webContents.openDevTools();
  ipcMain.once('angular-up', () => {
    mainWindow.show();
    // mainWindow.maximize();
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

ipcMain.on('render-poster', (event: any, schedule: Schedule, start_date: Date, weeks: number) => {

});

ipcMain.on('render-brochure', (event: any, schedule: Schedule) => {

});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
