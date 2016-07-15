import { Component, Input } from '@angular/core';
import { MovieSearchService, FilmInfo } from './movie-search.service';
import { SeriesView, Series } from './series.view';



@Component({
  moduleId: module.id,
  selector: 'series-list-view',
  directives: [SeriesView],
  styleUrls: ['./series-list.view.css'],
  template: `
    <div class="container">
      <div class="sidebar">
        <div class="series-label" *ngFor="let series of seriesList" (click)="selectSeries(series)">{{series.title}}</div>
      </div>
      <div class="content">
        <series-view *ngIf="active_series" [series]="active_series"></series-view>
      </div>
    </div>
  `
})
export class SeriesListView {
  @Input() private seriesList: Series[];
  private active_series: Series;
  constructor() {

  }
  ngOnInit() {

  }
  selectSeries(series: Series) {
    if (this.active_series && this.active_series === series) {
      this.active_series = undefined;
    } else {
      this.active_series = series;
    }
  }
}
