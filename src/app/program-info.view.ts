import { Component, Directive, ElementRef, AfterContentInit, HostListener, Input } from '@angular/core';

export interface Section {
  section_title: string;
  section_text: string;
}

@Directive({ selector: '[elastic]' })
class ElasticDirective implements AfterContentInit {
  constructor(private ref: ElementRef) {}
  ngAfterContentInit() {
    this.ref.nativeElement.style.height = `100px`;
  }
  @HostListener('ngModelChange') onModelChange() {
    this.resize();
  }
  private resize() {
    this.ref.nativeElement.style.height = `0px`;
    this.ref.nativeElement.style.height = `${this.ref.nativeElement.scrollHeight}px`;
  }
}


@Component({
  moduleId: module.id,
  selector: 'program-info-view',
  directives: [ElasticDirective],
  styleUrls: ['./program-info.view.css'],
  template: `
    <div class="container">
      <div class="section" *ngFor="let info of program_info; let i = index">
        <md-input class="title" placeholder="Section Title" [(ngModel)]="info.section_title" style="width: 20em"></md-input>
        <div class="remove-btn" (click)="removeSection(i)">x</div>
        <textarea elastic class="text" [(ngModel)]="info.section_text"></textarea>
      </div>
      <div class="insert-btn" (click)="insertNewSection()">+ Insert New Section</div>
    </div>
  `
})
export class ProgramInfoView {
  @Input() private program_info: Section[];
  constructor() {}
  insertNewSection() {
    this.program_info.push({
      section_title: '',
      section_text: ''
    });
  }
  removeSection(idx: number) {
    this.program_info.splice(idx, 1);
  }
}
