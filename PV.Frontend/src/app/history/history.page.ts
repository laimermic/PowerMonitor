import { Component, OnInit } from '@angular/core';
import { IonicModule, ViewDidEnter } from '@ionic/angular';
import { InfluxResult } from '../models/InfluxResult';
import { HistoryResponse } from '../models/HistoryResponse';
import { CanvasJSChart } from 'src/assets/canvasjs.angular.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartDataPoint, ChartDataSeriesOptions } from 'canvasjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AppConfig } from '../models/AppConfig';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['history.page.scss'],
  standalone: true,
  imports: [IonicModule, CanvasJSChart, CommonModule, FormsModule, HttpClientModule]
})
export class HistoryPage implements ViewDidEnter {

  public prodEntries: InfluxResult[] | null = new Array<InfluxResult>();
  public prodDataPoints: Array<CanvasJS.ChartDataPoint> | null = null;
  public usageDataPoints: Array<CanvasJS.ChartDataPoint> | null = null;
  public showProd: boolean = true;
  public showConsumption: boolean = false;
  public showDelivery: boolean = false;
  public chartOptions: CanvasJS.ChartOptions | null = {
    title: {},
    data: []
  };
  public loading: boolean = true;

  constructor(private http: HttpClient) { }

  public renderChart() {
    console.log("rendering");
    var data = new Array<ChartDataSeriesOptions>();
    var prodEntry = {
      type: "area",
      color: "#ffae00",
      markerColor: "#ffae00",
      name: "Production",
      xValueFormatString: "HH:mm",
      dataPoints: this.prodDataPoints ?? new Array<CanvasJS.ChartDataPoint>(),
      legendText: "Production",
      showInLegend: true,
      visible: this.showProd
    }
    data.push(prodEntry);

    var usageEntry = {
      type: "area",
      color: "#325ea8",
      markerColor: "#325ea8",
      name: "Usage",
      xValueFormatString: "HH:mm",
      dataPoints: this.usageDataPoints ?? new Array<CanvasJS.ChartDataPoint>(),
      legendText: "Usage",
      showInLegend: true
    }
    data.push(usageEntry)

    var maxDate = new Date();
    maxDate.setHours(23);
    maxDate.setMinutes(59);
    this.chartOptions = {
      title: {},
      data: []
    }
    this.chartOptions = null;
    this.chartOptions = {
      animationEnabled: true,
      title: {},
      backgroundColor: "#ffffff00",
      theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark2" : "light2",
      axisX: {
        valueFormatString: "HH:mm",
        maximum: maxDate.getTime()
      },
      axisY: {
        minimum: 0
      },
      data: data
    }
    console.log(this.chartOptions)
  }

  public async getHistory() {
    var date = Math.floor(new Date().getTime() / 1000);
    var response = (await lastValueFrom(this.http.get(AppConfig.backendUrl + "/api/day/" + date))) as HistoryResponse;
    this.prodDataPoints = response.production.map(entry => { return { x: new Date(entry._time), y: entry._value, label: 'Production' } });
    this.usageDataPoints = response.usage.map(entry => { return { x: new Date(entry._time), y: entry._value, label: 'Usage' } });
    this.renderChart();
    this.loading = false;
  }

  ionViewDidEnter(): void {
    this.getHistory()
  }

}
