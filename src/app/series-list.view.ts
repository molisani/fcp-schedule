import { Component, Input } from '@angular/core';

import { MovieSearchService, FilmInfo } from './movie-search.service';
import { SeriesView, Series } from './series.view';
import { Schedule } from './schedule.view';

@Component({
  moduleId: module.id,
  selector: 'series-list-view',
  directives: [SeriesView],
  styleUrls: ['./series-list.view.css'],
  template: `
    <div class="container">
      <div class="sidenav">
        <md-list dense>
          <md-list-item *ngFor="let series of schedule.series">
              <h3 md-line class="title"
                (click)="selectSeries(series)"
                [class.selected]="series === active_series">{{series.title}}</h3>
              <i md-line class="subtitle">{{series.weekday}}s - {{series.curator}}</i>
              <div class="remove-series" (click)="removeSeries(series)">x</div>
          </md-list-item>
        </md-list>
        <div class="insert-btn" (click)="newSeries()">+ Insert New Series</div>
      </div>
      <div class="content" *ngIf="active_series">
        <series-view *ngIf="active_series" [series]="active_series"></series-view>
      </div>
    </div>
  `
})
export class SeriesListView {
  @Input() private schedule: Schedule;
  private active_series: Series;
  constructor() {

  }
  ngOnInit() {
    if (this.schedule.series.length > 0) {
      this.active_series = this.schedule.series[0];
    }
  }
  selectSeries(series: Series) {
    if (this.active_series && this.active_series === series) {
      this.active_series = undefined;
    } else {
      this.active_series = series;
    }
  }
  removeSeries(series: Series) {
    if (this.active_series && this.active_series === series) {
      this.active_series = undefined;
    }
    this.schedule.series.splice(this.schedule.series.indexOf(series), 1);
  }
  newSeries() {
    this.schedule.series.push({
      title: 'New Series',
      curator: '',
      weekday: null,
      brochure: false,
      screenings: [],
    })
  }
}
