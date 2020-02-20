import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'tmc-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css']
})
export class IconComponent implements OnInit {

  @Input() tmcIconType: string;
  @Input() tmcIconSize: string = 'small';
  @Input() color: string = '';
  @Input() tmcType:string = 'icon';
  constructor() { }

  ngOnInit() {
  }

  getSufix(){
    return this.color ? '-' + this.color : '';
  }

}
