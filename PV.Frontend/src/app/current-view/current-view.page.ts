import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { CurrentEntry } from '../models/CurrentEntry';
import * as CanvasJS from 'canvasjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AppConfig } from '../models/AppConfig';

@Component({
  selector: 'app-tab1',
  templateUrl: 'current-view.page.html',
  styleUrls: ['current-view.page.scss'],
  standalone: true,
  imports: [IonicModule, HttpClientModule],
})
export class CurrentViewPage implements ViewDidEnter, ViewDidLeave {

  public currentEntry: CurrentEntry | null = null;
  public currentNeed: number = 0;
  public interval: any = 0;
  constructor(private http: HttpClient) { }

  public async getNow() {
    this.currentEntry = (await lastValueFrom(this.http.get(AppConfig.backendUrl + "/api/now"))) as CurrentEntry;
    if (this.currentEntry.consumption.value > 0) {
      this.currentNeed = this.currentEntry.consumption.value + this.currentEntry.production.value;
    } else {
      this.currentNeed = this.currentEntry.production.value - this.currentEntry.delivery.value;
    }
  }
  ionViewDidEnter() {
    this.interval = setInterval(() => {
      this.getNow();
    }, 10000)
    this.getNow();
  }
  ionViewDidLeave(): void {
    clearInterval(this.interval);
    console.log("View left")
  }

}
