import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

export interface OMDbFilmInfo {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  Response: string;
}

export interface FilmInfo {
  title: string;
  year: number;
  runtime: number;
  director: string;
  posterURL: string;
}

@Injectable()
export class MovieSearchService {
  private static parse(res: Response, callback: (info: FilmInfo) => void) {
    try {
      let omdb: OMDbFilmInfo = res.json();
      let info: FilmInfo = {
        title: omdb.Title,
        year: parseInt(omdb.Year),
        runtime: parseInt(omdb.Runtime),
        director: omdb.Director,
        posterURL: omdb.Poster,
      };
      callback(info);
    } catch (err) {}
  }
  private rootURL = '';
  constructor(private http: Http) {
  }
  public searchByTitle(title: string, callback: (info: FilmInfo) => void) {
    this.http.get('http://www.omdbapi.com/?type=movie&t=' + encodeURI(title)).subscribe((res: Response) => {
      MovieSearchService.parse(res, callback);
    })
  }
}
