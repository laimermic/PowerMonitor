import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { CurrentEntry } from '../models/CurrentEntry';
import * as CanvasJS from 'canvasjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AppConfig } from '../models/AppConfig';
import { DayEntry } from '../models/DayEntry';

@Component({
  selector: 'app-tab1',
  templateUrl: 'current-view.page.html',
  styleUrls: ['current-view.page.scss'],
  standalone: true,
  imports: [IonicModule, HttpClientModule],
})
export class CurrentViewPage implements ViewDidEnter, ViewDidLeave {

  public currentEntry: CurrentEntry | null = null;
  public interval: any = 0;
  public houseusage: number = 0;
  public selfsufficiency: number = 0;
  public houseUsageChart: CanvasJS.ChartOptions | null = null;
  public dayEntry: DayEntry | null = null;
  constructor(private http: HttpClient) { }

  public async getNow() {
    this.currentEntry = (await lastValueFrom(this.http.get(AppConfig.backendUrl + "/api/now"))) as CurrentEntry;
    console.log(this.currentEntry);
    var usage = this.currentEntry?.usage?.value ?? 0;
    var prod = this.currentEntry?.production?.value ?? 1;
    console.log("Usage: " + usage);
    console.log("Prod: " + prod);
    if ((usage / prod) > 1) {
      this.houseusage = 100;
    } else {
      this.houseusage = (usage / prod) * 100;
    }

    if ((prod / usage) > 1) {
      this.selfsufficiency = 100;
    } else {
      this.selfsufficiency = (prod / usage) * 100;
    }
  }
  public async getFullDay() {
    this.http.get(AppConfig.backendUrl + '/api/fullday/' + new Date().getTime()).subscribe(response => {
      console.log(response);
      this.dayEntry = response as DayEntry;

      this.houseUsageChart = {
        animationEnabled: true,
        title: {
          text: ""
        },
        data: []
      }
    })
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
