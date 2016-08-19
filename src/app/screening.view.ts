import { Component, Input } from '@angular/core';
import { MovieSearchService, FilmInfo } from './movie-search.service';
import { Series } from './series.view';

export interface Screening {
  film: FilmInfo;
  date: string;
  time: string;
  credit: boolean;
  classic: boolean;
}

@Component({
  moduleId: module.id,
  selector: 'screening-view',
  providers: [MovieSearchService],
  styleUrls: ['./screening.view.css'],
  template: `
    <div class="screening">
      <div class="info">
        <input type="text" class="title" [(ngModel)]="screening.film.title">
        <div class="year">
          (<input type="number" [(ngModel)]="screening.film.year">)
        </div>
        <div class="director">
          <b>Directed by </b><input type="text" [(ngModel)]="screening.film.director">
        </div>
        <div class="runtime">
          <input type="number" [(ngModel)]="screening.film.runtime"> minutes
        </div>
        <div class="options">
          <div class="credit">
            Credit: <input type="checkbox" [(ngModel)]="screening.credit">
          </div>
          <div class="classic">
            Classic: <input type="checkbox" [(ngModel)]="screening.classic">
          </div>
        </div>
        <div class="poster-url">
          <b>Poster: </b><input type="text" [(ngModel)]="screening.film.posterURL">
        </div>
        <br class="spacer">
        <div class="date">
          <div class="btn" (click)="changeDate(false)">&lt;</div>
          <input type="text" [(ngModel)]="screening.date">
          <div class="btn" (click)="changeDate(true)">&gt;</div>
        </div>
        <div class="time">
          <input type="text" [(ngModel)]="screening.time">
        </div>
        <br class="spacer">
      </div>
      <div class="poster">
        <img *ngIf="screening.film.posterURL" src="{{screening.film.posterURL}}">
      </div>
      <div class="auto-fill-btn" (click)="autoFill()">auto-fill</div>
    </div>
  `
})
export class ScreeningView {
  @Input() private series: Series;
  @Input() private screening: Screening;
  constructor(private movieSearch: MovieSearchService) {

  }
  ngOnInit() {

  }
  autoFill() {
    this.movieSearch.searchByTitle(this.screening.film.title, (info) => {
      this.screening.film = info;
    })
  }
  changeDate(forward: boolean) {
    console.log(this);
    let tempDate = new Date(this.screening.date);
    let change = (forward ? 1 : -1) * (this.series.weekday ? 7 : 1);
    tempDate.setDate(tempDate.getDate() + change);
    let month: String;
    switch (tempDate.getMonth()) {
      case 0: month = 'January'; break;
      case 1: month = 'February'; break;
      case 2: month = 'March'; break;
      case 3: month = 'April'; break;
      case 4: month = 'May'; break;
      case 5: month = 'June'; break;
      case 6: month = 'July'; break;
      case 7: month = 'August'; break;
      case 8: month = 'September'; break;
      case 9: month = 'October'; break;
      case 10: month = 'November'; break;
      case 11: month = 'December'; break;
    }
    this.screening.date = `${month} ${tempDate.getDate()}`;
  }
}
