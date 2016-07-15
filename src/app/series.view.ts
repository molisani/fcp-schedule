import { Component, Input } from '@angular/core';
import { MovieSearchService, FilmInfo } from './movie-search.service';
import { ScreeningView, Screening } from './screening.view';

export interface Series {
  title: string;
  curator: string;
  weekday: string;
  brochure: boolean;
  screenings: Screening[];
}

@Component({
  moduleId: module.id,
  selector: 'series-view',
  directives: [ScreeningView],
  styleUrls: ['./series.view.css'],
  template: `
    <div *ngIf="series">
      <input type="text" class="series-title-field" [(ngModel)]="series.title">
      <div class="weekday-input">
        <div *ngFor="let weekday of weekdays"
          class="button"
          [class.active]="series.weekday === weekday"
          (click)="setWeekday(weekday)">{{weekday.charAt(0)}}</div>
      </div>
      <div class="series-curator">
        <span>Curated By: </span>
        <input type="text" [(ngModel)]="series.curator">
      </div>
      <screening-view *ngFor="let screening of series.screenings" [screening]="screening"></screening-view>
    </div>
  `
})
export class SeriesView {
  private weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  @Input() private series: Series;
  constructor() {

  }
  ngOnInit() {

  }
  setWeekday(weekday: string) {
    this.series.weekday = weekday;
  }
}
