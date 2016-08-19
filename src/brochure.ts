import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode, Component, NgZone, OnInit, AfterViewChecked } from '@angular/core';
import { environment } from './app/';
import { Schedule } from './app/schedule.view';

const ipcRenderer = window['require'] ? (<any>window).require('electron').ipcRenderer : null;

if (environment.production) {
  enableProdMode();
}

@Component({
  moduleId: module.id,
  selector: 'brochure-renderer',
  directives: [],
  styleUrls: ['./app/renderers/brochure.renderer.css'],
  templateUrl: './app/renderers/brochure.renderer.html',
})
export class BrochureRenderer implements OnInit, AfterViewChecked {
  public schedule: Schedule;
  public revision: string;
  private finishedUpdating = false;
  constructor(zone: NgZone) {
    let today = new Date();
    this.revision = `${today.getMonth()}/${today.getDate()}/${today.getFullYear()} rev`;
    ipcRenderer.on('+view:open-schedule', (event: any, schedule: Schedule) => {
      zone.run(() => {
        this.schedule = schedule;
        this.finishedUpdating = true;
      });
    });
  }
  ngOnInit() {
    ipcRenderer.send('+main:brochure-angular-up');
  }
  ngAfterViewChecked() {
    if (this.schedule && this.finishedUpdating) {
      setTimeout(() => {
        ipcRenderer.send('+main:brochure-ready');
        this.finishedUpdating = false;
        console.log(this.schedule);
      }, 0);
    }
  }
}


bootstrap(BrochureRenderer);
