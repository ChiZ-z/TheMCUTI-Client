import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Config } from 'src/app/core';
import { trigger, state, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'tmc-stick',
  templateUrl: './stick.component.html',
  styleUrls: ['./stick.component.css']
})
export class StickComponent implements OnInit {

  @Input() config: Config[];
  @Input() selectedCount: number;
  @Output() action = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  event(action: string) {
    this.action.emit(action);
  }

  emptyMethod(){}

}
