import { Component, NgZone, OnInit } from '@angular/core';
import { SeriesListView } from './series-list.view';
import { Series } from './series.view';

const ipcRenderer = window['require'] ? (<any>window).require('electron').ipcRenderer : null;

export interface Schedule {
  semester: string;
  series: Series[];
  // personnel: Position[];
}

export interface ProgramInfo {
  section_title: string;
  section_text: string;
}

export interface Position {
  title: string;
  people: string[];
}


@Component({
  moduleId: module.id,
  selector: 'schedule-view',
  directives: [SeriesListView],
  styleUrls: ['./schedule.view.css'],
  template: `
    <div *ngIf="schedule" class="frame">
      <input type="text" [(ngModel)]="schedule.semester" class="semester-field">
      <a class="tab" (click)="toggleInfo(false)">Series List</a>
      <a class="tab" (click)="toggleInfo(true)">Program Info</a>
      <div class="content">
        <series-list-view *ngIf="!display_info" [seriesList]="schedule.series"></series-list-view>
      </div>
    </div>
  `
})
export class ScheduleView implements OnInit {
  public schedule: Schedule;
  private active_series: Series;
  private display_info: boolean = false;
  constructor(zone: NgZone) {
    ipcRenderer.on('open-schedule', (event: any, schedule: Schedule) => {
      zone.run(() => {
        this.schedule = schedule;
      })
    });
    ipcRenderer.on('request-schedule', (event: any) => {
      ipcRenderer.send('get-schedule', this.schedule);
    });
  }
  ngOnInit() {
    ipcRenderer.send('angular-up');
  }
  toggleInfo(displayInfo: boolean) {
    this.display_info = displayInfo;
  }
}
