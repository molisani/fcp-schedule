import { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog } from 'electron';

import * as fs from 'fs';
import * as path from 'path';

import { Schedule } from './app/schedule.view';

let mainWindow: Electron.BrowserWindow;
let save: Electron.MenuItem;
let currentFile: string;

function createMenu(): Electron.Menu {
  let main = new Menu();
  let scheduleMenu = new Menu();
  let newSchedule = new MenuItem({
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
  scheduleMenu.append(newSchedule);
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
  scheduleMenu.append(open);
  let merge = new MenuItem({
    label: 'Merge',
    accelerator: 'CmdOrCtrl+M',
    click(item, focusedWindow) {
      if (focusedWindow) {
        dialog.showOpenDialog(focusedWindow, {
          filters: [{ name: 'Schedules', extensions: ['json']}],
          properties: ['openFile'],
        }, (filenames: string[]) => {
          if (filenames && filenames[0]) {
            fs.readFile(filenames[0], 'utf8', (err, data) => {
              if (err) throw err;
              let new_schedule: Schedule = JSON.parse(data);
              getCurrentSchedule((schedule) => {
                schedule.series = schedule.series.concat(new_schedule.series);
                mainWindow.webContents.send('open-schedule', schedule);
              });
            });
          }
        });
      }
    }
  });
  scheduleMenu.append(merge);
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
  scheduleMenu.append(save);
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
  scheduleMenu.append(saveAs);
  main.append(new MenuItem({
    label: 'Schedule',
    submenu: scheduleMenu
  }));
  let generateMenu = new Menu();
  let poster = new MenuItem({
    label: 'Poster',
    accelerator: 'CmdOrCtrl+P',
    click(item, focusedWindow) {
      console.log('not yet')
    }
  });
  generateMenu.append(poster);
  let brochure = new MenuItem({
    label: 'Brochure',
    accelerator: 'CmdOrCtrl+B',
    click(item, focusedWindow) {
      if (focusedWindow) {
        dialog.showSaveDialog(focusedWindow, {
          filters: [{ name: 'PDF', extensions: ['pdf']}],
        }, (filename: string) => {
          if (filename) {
            renderBrochure(filename);
          }
        });
      }
    }
  });
  generateMenu.append(brochure);
  main.append(new MenuItem({
    label: 'Generate',
    submenu: generateMenu,
  }));
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

function renderPoster(filename: string, schedule: Schedule, start_date: Date, weeks: number) {

};

function renderBrochure(filename: string) {
  getCurrentSchedule((schedule) => {
    let brochureWindow = new BrowserWindow({height: 777, width: 1022, show: false});
    brochureWindow.webContents.openDevTools();
    brochureWindow.setMenu(null);
    brochureWindow.loadURL(`file://${__dirname}/brochure.html`);
    ipcMain.once('brochure-angular-up', () => {
      brochureWindow.show();
      brochureWindow.webContents.send('open-schedule', schedule);
    });
    ipcMain.once('brochure-ready', () => {
      brochureWindow.webContents.printToPDF({
        marginsType: 1,
        printBackground: true,
        printSelectionOnly: false,
        landscape: true,
        pageSize: 'Letter',
      }, (err, data) => {
        if (err) throw err;
        fs.writeFile(filename, data, (err) => {
          if (err) throw err;
          console.log('Write PDF successfully.');
          dialog.showMessageBox({
            type: 'info',
            title: 'PDF Saved',
            message: 'Brochure rendered and saved to file.',
            buttons: ['OK'],
          });
          // brochureWindow.close();
        });
      });
    });
  });
};

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
