import { Component, Input } from '@angular/core';
import { MovieSearchService, FilmInfo } from './movie-search.service';

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
      <input type="text" class="title" [(ngModel)]="screening.film.title">
      <span class="info">
        Directed by <input type="text" [(ngModel)]="screening.film.director">
        (<input type="number" [(ngModel)]="screening.film.year">) - <input type="number" [(ngModel)]="screening.film.runtime"> minutes</span>
      <div>
        Credit: <input type="checkbox" [(ngModel)]="screening.credit">
      </div>
      <div>
        Classic: <input type="checkbox" [(ngModel)]="screening.classic">
      </div>
      <a (click)="autoFill()">Auto-Fill</a>
    </div>
  `
})
export class ScreeningView {
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
}
