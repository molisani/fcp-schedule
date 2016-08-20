import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode, Pipe, PipeTransform, Component, NgZone, OnInit, AfterViewChecked } from '@angular/core';
import { environment } from './app/';
import { Schedule } from './app/schedule.view';
import { Screening } from './app/screening.view';

const ipcRenderer = window['require'] ? (<any>window).require('electron').ipcRenderer : null;
const webFrame = window['require'] ? (<any>window).require('electron').webFrame : null;
const remote = window['require'] ? (<any>window).require('electron').remote : null;

if (environment.production) {
  enableProdMode();
}


@Pipe({ name: 'time12H' })
class Time12HPipe implements PipeTransform {
  transform(val: string): string {
    let split = val.split(":");
    let hour = ((parseInt(split[0]) + 11) % 12 + 1);
    return `${hour}:${split[1]}`;
  }
}

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];

@Component({
  moduleId: module.id,
  selector: 'poster-renderer',
  pipes: [Time12HPipe],
  styleUrls: ['./app/renderers/poster.renderer.css'],
  templateUrl: './app/renderers/poster.renderer.html',
})
export class PosterRenderer implements OnInit, AfterViewChecked {
  public schedule: Schedule;
  private month_str: string;
  private year: number
  private first_day: Date;
  private weeks: number;
  private screenings: Screening[];
  private finishedUpdating = false;
  constructor(zone: NgZone) {
    ipcRenderer.on('+view:debug-enabled', () => {
      let rightClick: { x: number, y: number } = null;
      let menu = new remote.Menu();
      let menuItem = new remote.MenuItem({
        label: 'Inspect Element',
        click: () => { remote.getCurrentWindow().webContents.inspectElement(rightClick.x, rightClick.y); }
      });
      menu.append(menuItem);
      window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        rightClick = { x: e.x, y: e.y };
        menu.popup(remote.getCurrentWindow());
      })
    });
    ipcRenderer.on('+view:open-schedule', (event: any, schedule: Schedule, month: number) => {
      zone.run(() => {
        this.month_str = MONTHS[month];
        let now = new Date();
        let current_year = now.getFullYear();
        this.year = now.getFullYear();
        if (now.getMonth() > 6 && month < 6) {
          this.year++;
        } else if (now.getMonth() < 6 && month > 6) {
          this.year--;
        }
        this.first_day = new Date(this.year, month, 1);
        console.log(this.first_day);
        let days_in_month = new Date(this.year, month + 1, 0).getDate();
        this.weeks = Math.ceil((days_in_month + this.first_day.getDay() + 1) / 7);

        this.screenings = [];
        for (let day = 1; day <= days_in_month; day++) {
          this.screenings.push(null);
        }

        let day_offset = this.first_day.getDay();
        schedule.series.forEach((series) => {
          series.screenings.forEach((screening) => {
            if (this.month_str === screening.date.split(" ")[0].toUpperCase()) {
              let day = parseInt(screening.date.split(" ")[1]);
              this.screenings[day + day_offset - 1] = screening;
            }
          });
        });

        this.schedule = schedule;
        this.finishedUpdating = true;
      });
    });
  }
  ngOnInit() {
    ipcRenderer.send('+main:poster-angular-up');
  }
  ngAfterViewChecked() {
    if (this.schedule && this.finishedUpdating) {
      setTimeout(() => {
        ipcRenderer.send('+main:poster-ready');
        this.finishedUpdating = false;
        webFrame.setZoomFactor(0.25);
      }, 100);
    }
  }
}


bootstrap(PosterRenderer);
