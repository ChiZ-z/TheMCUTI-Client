import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AutofocusDirective } from './directives';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent, StickComponent, HeaderSearchComponent } from './components';
import { AutosizeModule } from 'ngx-autosize';
import { ChartModule } from 'angular-highcharts';
import { DateChangerPipe } from './pipes';
import { ImageCropperModule } from 'ngx-image-cropper';
import { HeaderComponent, FooterComponent } from './layouts';
import { HeaderSearchCardComponent } from './components/header-search/header-search-card/header-search-card.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    NgZorroAntdModule,
    TranslateModule,
    AutosizeModule,
    ChartModule,
    ImageCropperModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    NgZorroAntdModule,
    AutofocusDirective,
    TranslateModule,
    IconComponent,
    AutosizeModule,
    StickComponent,
    ChartModule,
    DateChangerPipe,
    ImageCropperModule,
    HeaderSearchComponent,
    HeaderComponent,
    FooterComponent,
    HeaderSearchCardComponent
  ],
  declarations: [
    AutofocusDirective,
    IconComponent,
    StickComponent,
    DateChangerPipe,
    HeaderSearchComponent,
    HeaderComponent,
    FooterComponent,
    HeaderSearchCardComponent
  ],
  providers: [
    DateChangerPipe
  ]
})
export class SharedModule { }
