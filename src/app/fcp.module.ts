import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { MdButtonModule } from '@angular2-material/button';
import { MdInputModule } from '@angular2-material/input';
import { MdToolbarModule } from '@angular2-material/toolbar';
import { MdListModule } from '@angular2-material/list';
import { MdSidenavModule } from '@angular2-material/sidenav';
import { MdRippleModule } from '@angular2-material/core/ripple/ripple';

import { ScheduleView } from './schedule.view';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule, FormsModule,
    MdButtonModule, MdInputModule, MdToolbarModule, MdListModule, MdSidenavModule,
    MdRippleModule
  ],
  declarations: [ ScheduleView ],
  bootstrap: [ ScheduleView ],
})
export class FCPModule {
  constructor(appRef: ApplicationRef) {
    appRef.bootstrap(ScheduleView);
  }
}
