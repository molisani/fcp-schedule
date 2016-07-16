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
  private finishedRendering = false;
  constructor(zone: NgZone) {
    ipcRenderer.on('open-schedule', (event: any, schedule: Schedule) => {
      zone.run(() => {
        this.schedule = schedule;
      });
    });
  }
  ngOnInit() {
    ipcRenderer.send('brochure-angular-up');
  }
  ngAfterViewChecked() {
    if (this.schedule && !this.finishedRendering) {
      setTimeout(() => {
        ipcRenderer.send('brochure-ready');
        this.finishedRendering = true;
      }, 0);
    }
  }
}



bootstrap(BrochureRenderer);
