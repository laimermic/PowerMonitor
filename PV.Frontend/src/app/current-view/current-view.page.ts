import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonicModule, ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { CurrentEntry } from '../models/CurrentEntry';
import * as CanvasJS from 'canvasjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AppConfig } from '../models/AppConfig';
import { DayEntry } from '../models/DayEntry';
import { CanvasJSChart } from 'src/assets/canvasjs.angular.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tab1',
  templateUrl: 'current-view.page.html',
  styleUrls: ['current-view.page.scss'],
  standalone: true,
  imports: [IonicModule, HttpClientModule, CommonModule, FormsModule, CanvasJSChart],
})
export class CurrentViewPage implements ViewDidEnter, ViewDidLeave {

  public currentEntry: CurrentEntry | null = null;
  public interval: any = 0;
  public houseusage: number = 0;
  public selfsufficiency: number = 0;
  public houseUsageChart: CanvasJS.ChartOptions | null = null;
  public selfSufficencyChart: CanvasJS.ChartOptions | null = null;
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

      let houseUsageData: Array<CanvasJS.ChartDataPoint> = new Array<CanvasJS.ChartDataPoint>(
        {
          y: this.dayEntry.delivery,
          label: 'Netzeinspeisung',
          color: '#b8b8b8',
          toolTipContent: '<span style="color:#b8b8b8">{label}</span>: ' + (this.dayEntry.delivery / this.dayEntry.produced * 100).toFixed(0) + '%'
        },
        {
          y: this.dayEntry.produced - this.dayEntry.delivery,
          label: 'Eigenverbrauch',
          color: '#ffae00',
          toolTipContent: '<span style="color:#ffae00">{label}</span>: ' + (100 - this.dayEntry.delivery / this.dayEntry.produced * 100).toFixed(0) + '%'
        }
      )

      this.houseUsageChart = {
        animationEnabled: true,
        theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark2" : "light2",
        backgroundColor: "transparent",
        title: {
          text: (100 - (this.dayEntry.delivery / this.dayEntry.produced) * 100).toFixed(0) + '%',
          verticalAlign: 'center',
          fontSize: 22,
          fontFamily: 'Helvetica Neue',
          fontWeight: 'bold'
        },
        height: 200,
        legend: {

        },
        data: [{
          type: 'doughnut',
          dataPoints: houseUsageData,
          showInLegend: false
        }]
      }


      let selfSufficencyData: Array<CanvasJS.ChartDataPoint> = new Array<CanvasJS.ChartDataPoint>(
        {
          y: this.dayEntry.usage - this.dayEntry.consumption,
          label: 'Eigenerzeugung',
          color: '#ffae00',
          toolTipContent: '<span style="color:#ffae00">{label}</span>: ' + (((this.dayEntry?.usage ?? 0) - (this.dayEntry?.consumption ?? 0)) / this.dayEntry.usage * 100).toFixed(0) + '%'
        },
        {
          y: this.dayEntry.consumption,
          label: 'Netzbezug',
          color: '#b8b8b8',
          toolTipContent: '<span style="color:#b8b8b8">{label}</span>: ' + (this.dayEntry.consumption / this.dayEntry.usage * 100).toFixed(0) + '%'
        }
      )

      this.selfSufficencyChart = {
        animationEnabled: true,
        theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark2" : "light2",
        backgroundColor: "transparent",
        title: {
          text: (((this.dayEntry?.usage ?? 0) - (this.dayEntry?.consumption ?? 0)) / this.dayEntry.usage * 100).toFixed(0) + '%',
          verticalAlign: 'center',
          fontSize: 22,
          fontFamily: 'Helvetica Neue',
          fontWeight: 'bold'
        },
        height: 200,
        legend: {

        },
        data: [{
          type: 'doughnut',
          dataPoints: selfSufficencyData,
          showInLegend: false
        }]
      }
    })
  }

  ionViewDidEnter() {
    this.interval = setInterval(() => {
      this.getNow();
      this.getFullDay();
    }, 10000)
    this.getNow();
  }
  ionViewDidLeave(): void {
    clearInterval(this.interval);
    console.log("View left")
  }

}
