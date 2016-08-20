import { app, BrowserWindow, ipcMain, Menu, MenuItem, dialog } from 'electron';

import * as fs from 'fs';
import * as path from 'path';

import { Schedule } from './app/schedule.view';

const MICRONS_PER_INCH = 25400;

let mainWindow: Electron.BrowserWindow;
let save: Electron.MenuItem;
let currentFile: string;

let debug = process.argv.indexOf('--debug') > -1;
let startFile = process.argv.find((arg) => arg.endsWith('.json'));

function createNewSchedule() {
  let schedule: Schedule = { semester: '', series: [] };
  mainWindow.webContents.send('+view:open-schedule', schedule);
  save.enabled = false;
  currentFile = undefined;
};

function openScheduleFromFile(file: string) {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) throw err;
    let schedule = JSON.parse(data);
    mainWindow.webContents.send('+view:open-schedule', schedule);
    save.enabled = true;
    currentFile = file;
  });
}

function openScheduleFileDialog() {
  if (window) {
    dialog.showOpenDialog(mainWindow, {
      filters: [{ name: 'Schedules', extensions: ['json']}],
      properties: ['openFile'],
    }, (filenames: string[]) => {
      if (filenames && filenames[0]) {
        openScheduleFromFile(filenames[0]);
      }
    });
  }
}

function createMenu(): Electron.Menu {
  let main = new Menu();
  let scheduleMenu = new Menu();
  let newSchedule = new MenuItem({
    label: 'New',
    accelerator: 'CmdOrCtrl+N',
    click(item, focusedWindow) { createNewSchedule(); }
  });
  scheduleMenu.append(newSchedule);
  let open = new MenuItem({
    label: 'Open',
    accelerator: 'CmdOrCtrl+O',
    click(item, focusedWindow) { openScheduleFileDialog(); }
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
            fs.writeFile(currentFile, JSON.stringify(schedule, null, 2), 'utf8', (err) => {
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
              fs.writeFile(filename, JSON.stringify(schedule, null, 2), 'utf8', (err) => {
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
  let posterWrapper = (window: Electron.BrowserWindow, month: number) => {
    dialog.showSaveDialog(window, {
      filters: [{ name: 'PDF', extensions: ['pdf']}],
    }, (filename: string) => {
      if (filename) {
        renderPoster(filename, month);
      }
    });
  };
  let poster = new MenuItem({
    label: 'Poster',
    submenu: [
      {
        label: 'August', accelerator: 'F8',
        click(item, focusedWindow) { posterWrapper(focusedWindow, 7); }
      },
      {
        label: 'September', accelerator: 'F9',
        click(item, focusedWindow) { posterWrapper(focusedWindow, 8); }
      },
      {
        label: 'October', accelerator: 'F10',
        click(item, focusedWindow) { posterWrapper(focusedWindow, 9); }
      },
      {
        label: 'November', accelerator: 'F11',
        click(item, focusedWindow) { posterWrapper(focusedWindow, 10); }
      },
      {
        label: 'December', accelerator: 'F12',
        click(item, focusedWindow) { posterWrapper(focusedWindow, 11); }
      },
      {
        label: 'January', accelerator: 'F1',
        click(item, focusedWindow) { posterWrapper(focusedWindow, 0); }
      },
      {
        label: 'February', accelerator: 'F2',
        click(item, focusedWindow) { posterWrapper(focusedWindow, 1); }
      },
      {
        label: 'March', accelerator: 'F3',
        click(item, focusedWindow) { posterWrapper(focusedWindow, 2); }
      },
      {
        label: 'April', accelerator: 'F4',
        click(item, focusedWindow) { posterWrapper(focusedWindow, 3); }
      },
      {
        label: 'May', accelerator: 'F5',
        click(item, focusedWindow) { posterWrapper(focusedWindow, 4); }
      },
    ]
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
    ipcMain.once('+main:get-schedule', (event: any, schedule: Schedule) => {
      callback(schedule);
    });
    mainWindow.webContents.send('+view:request-schedule');
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({height: 650, width: 900, show: debug});
  if (debug) {
    mainWindow.webContents.openDevTools();
  }
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(createMenu());
  } else {
    mainWindow.setMenu(createMenu());
  }
  ipcMain.once('+main:angular-up', () => {
    if (debug) {
      mainWindow.webContents.send('+view:debug-enabled');
    }
    if (startFile) {
      openScheduleFromFile(startFile);
    }
    mainWindow.show();
  });
  ipcMain.on('+main:new-schedule', () => {
    createNewSchedule();
  });
  ipcMain.on('+main:open-schedule', () => {
    openScheduleFileDialog();
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
    app.quit();
  });
};

const posterPrintingSetting = {
  pageRage: [],
  mediaSize: {
    width_microns: 279400 / 11 * 27,
    height_microns: 431800 / 17 * 40,
    name: 'NA_LEDGER',
    custom_display_name: 'Tabloid'
  },
  landscape: false,
  color: 2,
  headerFooterEnabled: false,
  marginsType: 1,
  isFirstRequest: false,
  requestID: 1234,
  previewModifiable: true,
  printToPDF: true,
  printWithCloudPrint: false,
  printWithPrivet: false,
  printWithExtension: false,
  deviceName: 'Save as PDF',
  generateDraftData: true,
  fitToPageEnabled: false,
  duplex: 0,
  copies: 1,
  collate: true,
  shouldPrintBackgrounds: false,
  shouldPrintSelectionOnly: false
};

function renderPoster(filename: string, month: number) {
  getCurrentSchedule((schedule) => {
    let posterWindow = new BrowserWindow({width: 795, height: 800, show: debug});
    if (debug) {
      posterWindow.webContents.openDevTools();
    }
    posterWindow.setMenu(null);
    posterWindow.loadURL(`file://${__dirname}/poster.html`);
    ipcMain.once('+main:poster-angular-up', () => {
      if (debug) {
        posterWindow.webContents.send('+view:debug-enabled');
      }
      posterWindow.webContents.send('+view:open-schedule', schedule, month);
    });
    ipcMain.once('+main:poster-ready', () => {
      posterWindow.webContents['_printToPDF'](posterPrintingSetting, (err, data) => {
        if (err) throw err;
        fs.writeFile(filename, data, (err) => {
          if (err) throw err;
          console.log('Write PDF successfully.');
          dialog.showMessageBox({
            type: 'info',
            title: 'PDF Saved',
            message: 'Poster rendered and saved to file.',
            buttons: ['OK'],
          });
          if (!debug) {
            posterWindow.close();
          }
        });
      });
    });
  });
};

function renderBrochure(filename: string) {
  getCurrentSchedule((schedule) => {
    let brochureWindow = new BrowserWindow({height: 777, width: 1022, show: debug});
    if (debug) {
      brochureWindow.webContents.openDevTools();
    }
    brochureWindow.setMenu(null);
    brochureWindow.loadURL(`file://${__dirname}/brochure.html`);
    ipcMain.once('+main:brochure-angular-up', () => {
      if (debug) {
        brochureWindow.webContents.send('+view:debug-enabled');
      }
      brochureWindow.webContents.send('+view:open-schedule', schedule);
    });
    ipcMain.once('+main:brochure-ready', () => {
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
          if (!debug) {
            brochureWindow.close();
          }
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
