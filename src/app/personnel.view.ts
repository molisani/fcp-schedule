import { Component, Directive, ElementRef, AfterContentInit, HostListener, Input } from '@angular/core';

export interface Role {
  position: string;
  people: string[];
}


@Component({
  moduleId: module.id,
  selector: 'personnel-view',
  styleUrls: ['./personnel.view.css'],
  template: `
    <div class="container">
      <div class="section" *ngFor="let role of personnel; let i = index">
        <md-input class="title" placeholder="Position" [(ngModel)]="role.position" style="width: 20em"></md-input>
        <div class="remove-btn" (click)="removePosition(i)">x</div>
        <md-list dense>
          <md-list-item *ngFor="let person of role.people; let j = index">
              <input md-line [(ngModel)]="role.people[j]">
              <div class="remove-btn" (click)="removePerson(i, j)">x</div>
          </md-list-item>
        </md-list>
        <div class="insert-btn" (click)="insertNewPerson(i)">+ Insert New Person</div>
      </div>
      <div class="insert-btn" (click)="insertNewPosition()">+ Insert New Position</div>
    </div>
  `
})
export class PersonnelView {
  @Input() private personnel: Role[];
  constructor() {}
  insertNewPosition() {
    this.personnel.push({
      position: '',
      people: []
    });
  }
  removePosition(idx: number) {
    this.personnel.splice(idx, 1);
  }
  insertNewPerson(idx: number) {
    this.personnel[idx].people.push('');
  }
  removePerson(i: number, j: number) {
    this.personnel[i].people.splice(j, 1);
  }
}
