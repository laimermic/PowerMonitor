import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule, ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { InfluxResult } from '../models/InfluxResult';
import { HttpClient, HttpClientModule } from '@angular/common/http'
import { lastValueFrom } from 'rxjs';
import { CurrentEntry } from '../models/CurrentEntry';
import { CurrentField } from '../models/CurrentField';
import { CanvasJSChart } from 'src/assets/canvasjs.angular.component';
import { ChartDataPoint } from 'canvasjs';
import { BlinkComponent } from 'src/assets/blink.component';
import { AppConfig } from '../models/AppConfig';

@Component({
  selector: 'app-power-grid',
  templateUrl: 'power-grid.page.html',
  styleUrls: ['power-grid.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, CanvasJSChart, BlinkComponent],
})
export class PowerGridPage implements ViewDidEnter, ViewDidLeave {

  public interval: any;
  public dataOutDated: boolean = false;
  public chartView: string = 'today';
  public currentEntry: CurrentEntry | null = null;
  public chartOptions: CanvasJS.ChartOptions | null = {
    title: {},
    data: []
  };
  public historyInterval: any;
  public points: InfluxResult[] = new Array<InfluxResult>();
  public frequencyDataPoints: Array<CanvasJS.ChartDataPoint> | null = null;

  constructor(private http: HttpClient) { }

  public async getFreq() {
    this.currentEntry = (await lastValueFrom(this.http.get(AppConfig.backendUrl + "/api/now"))) as CurrentEntry;
    var compareDate = new Date();
    compareDate.setSeconds(compareDate.getSeconds() - 120);
    var froniusDate = new Date(this.currentEntry?.frequency?.time ?? new Date())
    if (froniusDate > compareDate) {
      this.dataOutDated = false;
    } else {
      this.dataOutDated = true;
    }
  }

  public segmentChanged(e: any) {
    this.chartView = e.detail.value;
    this.renderChart();
  }

  public async getHistory() {
    this.points = (await lastValueFrom(this.http.get(AppConfig.backendUrl + "/api/freqtoday"))) as Array<InfluxResult>;
    this.frequencyDataPoints = this.points.map(point => { return { x: new Date(point._time), y: Math.round((point._value + Number.EPSILON) * 100) / 100 } });
    this.renderChart();
  }

  public renderChart() {
    var xMin = new Date();
    switch (this.chartView) {
      case 'today':
        xMin = new Date(this.points[0]._time);
        break;

      case 'lastHour':
        xMin.setMinutes(xMin.getMinutes() - 60)
        break;

      case 'last5Minutes':
        xMin.setMinutes(xMin.getMinutes() - 5)
        break;

      default:
        break;
    }
    this.chartOptions = {
      animationEnabled: true,
      title: {},
      backgroundColor: "#ffffff00",
      theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark2" : "light2",
      axisX: {
        valueFormatString: "HH:mm",
        minimum: xMin.getTime(),
        maximum: new Date().getTime()
      },
      axisY: {
        title: "Frequency in Hz",
        minimum: 49.5,
        maximum: 50.5,
        stripLines: [
          {
            startValue: 49.797,
            endValue: 49.803,
            color: "#ff1900",
            label: "Toleranzgrenze",
            labelFontColor: "#ff1900",
            labelWrap: false,
            labelMaxWidth: 200
          },
          {
            startValue: 50.203,
            endValue: 50.197,
            color: "#ff1900",
            label: "Toleranzgrenze",
            labelFontColor: "#ff1900",
            labelWrap: false,
            labelMaxWidth: 200
          }
        ]
      },
      data: [{
        type: 'line',
        name: 'Frequenz',
        dataPoints: this.frequencyDataPoints ?? new Array<ChartDataPoint>(),
        xValueFormatString: "HH:mm",
      }]
    }
  }

  async ionViewDidEnter(): Promise<void> {
    this.interval = setInterval(() => {
      this.getFreq();
      this.renderChart
    }, 10000)
    this.getFreq();
    this.historyInterval = setInterval(async () => {
      await this.getHistory();
    }, 20000)
    await this.getHistory();
  }

  ionViewDidLeave(): void {
    clearInterval(this.interval);
    clearInterval(this.historyInterval)
  }
}
