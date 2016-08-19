import { Component, ElementRef, NgZone, ViewChild, OnInit } from '@angular/core';

import { SeriesListView } from './series-list.view';
import { Series } from './series.view';

import { ProgramInfoView } from './program-info.view';
import { PersonnelView } from './personnel.view';

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
  directives: [SeriesListView, ProgramInfoView, PersonnelView],
  styleUrls: ['./schedule.view.css'],
  template: `
    <div *ngIf="schedule" class="frame">
      <md-toolbar>
        <md-input class="semester-field" placeholder="Schedule Title" [(ngModel)]="schedule.semester"></md-input>
        <button md-raised-button [disableRipple]="true" class="section-btn" (click)="showSeriesList()">Series List</button>
        <button md-raised-button [disableRipple]="true" class="section-btn" (click)="showProgramInfo()">Program Info</button>
        <button md-raised-button [disableRipple]="true" class="section-btn" (click)="showPersonnel()">Personnel</button>
      </md-toolbar>
      <series-list-view #seriesListView [schedule]="schedule"></series-list-view>
      <program-info-view #programInfoView hidden [program_info]="schedule.program_info"></program-info-view>
      <personnel-view #personnelView hidden [personnel]="schedule.personnel"></personnel-view>
    </div>

    <div *ngIf="!schedule" class="frame center">
      <div class="intro-panel">
        <div class="title">Film Culture Program Scheduling</div>
        <div class="divider"></div>
        <div class="button-bar">
          <div class="btn new-btn" (click)="newSchedule()">NEW</div>
          <div class="btn open-btn" (click)="openSchedule()">OPEN</div>
        </div>
      </div>
    </div>
  `
})
export class ScheduleView implements OnInit {
  @ViewChild('seriesListView', { read: ElementRef }) private seriesListView;
  @ViewChild('programInfoView', { read: ElementRef }) private programInfoView;
  @ViewChild('personnelView', { read: ElementRef }) private personnelView;
  public schedule: Schedule;
  private active_series: Series;
  private display_info: boolean = false;
  constructor(zone: NgZone) {
    ipcRenderer.on('+view:open-schedule', (event: any, schedule: Schedule) => {
      zone.run(() => {
        this.schedule = schedule;
      })
    });
    ipcRenderer.on('+view:request-schedule', (event: any) => {
      ipcRenderer.send('+main:get-schedule', this.schedule);
    });
  }
  ngOnInit() {
    ipcRenderer.send('+main:angular-up');
  }
  showSeriesList() {
    this.seriesListView.nativeElement.hidden = false;
    this.programInfoView.nativeElement.hidden = true;
    this.personnelView.nativeElement.hidden = true;
  }
  showProgramInfo() {
    this.seriesListView.nativeElement.hidden = true;
    this.programInfoView.nativeElement.hidden = false;
    this.personnelView.nativeElement.hidden = true;
  }
  showPersonnel() {
    this.seriesListView.nativeElement.hidden = true;
    this.programInfoView.nativeElement.hidden = true;
    this.personnelView.nativeElement.hidden = false;
  }
  newSchedule() {
    ipcRenderer.send('+main:new-schedule');
  }
  openSchedule() {
    ipcRenderer.send('+main:open-schedule');
  }
}
