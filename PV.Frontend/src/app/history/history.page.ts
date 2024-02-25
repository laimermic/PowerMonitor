import { Component, OnInit } from '@angular/core';
import { IonicModule, ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { InfluxResult } from '../models/InfluxResult';
import { HistoryResponse } from '../models/HistoryResponse';
import { CanvasJSChart } from 'src/assets/canvasjs.angular.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartDataPoint, ChartDataSeriesOptions } from 'canvasjs';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { AppConfig } from '../models/AppConfig';
import { DayEntry } from '../models/DayEntry';
import { MonthEntry } from '../models/History/MonthEntry';
import { YearEntry } from '../models/History/YearEntry';
import * as CanvasJS from 'canvasjs';
import { TotalEntry } from '../models/History/TotalEntry';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['history.page.scss'],
  standalone: true,
  imports: [IonicModule, CanvasJSChart, CommonModule, FormsModule, HttpClientModule]
})
export class HistoryPage implements ViewDidEnter, ViewDidLeave {

  public prodEntries: InfluxResult[] | null = new Array<InfluxResult>();
  public prodDataPoints: Array<CanvasJS.ChartDataPoint> | null = null;
  public usageDataPoints: Array<CanvasJS.ChartDataPoint> | null = null;
  public currentView: string = 'today';

  public dayEntry: DayEntry | null = null;
  public monthEntry: MonthEntry | null = null;
  public yearEntry: YearEntry | null = null;
  public totalEntry: TotalEntry | null = null;

  private refresher: any;
  public selectedDay: Date = new Date();
  public today: Date = new Date();

  public dayEntries: DayEntry[] | null = null;
  public monthEntries: MonthEntry[] | null = null;
  public yearEntries: YearEntry[] | null = null;

  public chartOptions: CanvasJS.ChartOptions | null = {
    title: {},
    data: []
  };
  public monthChartOptions: CanvasJS.ChartOptions | null = {
    title: {},
    data: []
  };
  public yearChartOptions: CanvasJS.ChartOptions | null = {
    title: {},
    data: []
  };
  public totalChartOptions: CanvasJS.ChartOptions | null = {
    title: {},
    data: []
  }

  public loading: boolean = true;

  constructor(private http: HttpClient) { }

  public async viewChange(ev: any) {
    this.currentView = ev.detail.value;
    if (this.currentView == 'month') {
      this.getFullMonth(this.selectedDay);
      this.getCurrentMonth();
      clearInterval(this.refresher);
    } else if (this.currentView == 'year') {
      this.getFullYear(this.selectedDay);
      this.yearEntry = await this.getCurrentYear();
      clearInterval(this.refresher);
    } else if (this.currentView == 'day') {
      this.getHistory();
      this.getFullDay(this.selectedDay);
      this.refresher = setInterval(() => {
        this.getHistory();
        this.getFullDay(this.selectedDay);
      }, 30000)
    } else if (this.currentView == 'total') {
      this.getTotal();
      clearInterval(this.refresher);
    }
  }

  public getCurrentMonth() {
    this.http.get(AppConfig.backendUrl + '/api/month/' + this.selectedDay.getTime()).subscribe(response => {
      this.monthEntry = response as MonthEntry;
    });
  }

  public async getCurrentYear(): Promise<YearEntry> {
    return (await lastValueFrom(this.http.get(AppConfig.backendUrl + '/api/year/' + this.selectedDay.getTime())) as YearEntry);
  }

  public renderChart() {
    var data = new Array<ChartDataSeriesOptions>();
    var prodEntry = {
      type: "area",
      color: "#ffae00",
      markerColor: "#ffae00",
      name: "Production",
      xValueFormatString: "HH:mm",
      dataPoints: this.prodDataPoints ?? new Array<CanvasJS.ChartDataPoint>(),
      legendText: "Production",
      showInLegend: true
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

    var minDate = new Date(this.selectedDay.getTime());
    minDate.setHours(0, 0, 0);
    var maxDate = this.selectedDay;
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
        minimum: minDate.getTime(),
        maximum: maxDate.getTime()
      },
      axisY: {
        minimum: 0
      },
      toolTip: {
        enabled: true,
        shared: true
      },
      data: data
    }
  }

  public renderMonthChart(month: Date) {
    var data = new Array<ChartDataSeriesOptions>();
    data.push({
      type: "column",
      color: "#ffae00",
      markerColor: "#ffae00",
      name: "Production",
      xValueFormatString: "DD.MM.YYYY",
      dataPoints: this.dayEntries?.map(entry => {
        var xDate = new Date(entry.lastupdated);
        xDate.setHours(0, 0, 0);
        return {
          x: xDate.getDate(),
          y: Math.round(((entry.produced / 1000) + Number.EPSILON) * 100) / 100,
          // toolTipContent: '<span style="color:#ffae00">Produktion</span>: ' + (entry.produced / 1000).toFixed(2) + 'kWH'
        }
      }) ?? new Array<CanvasJS.ChartDataPoint>(),
      legendText: "Produktion",
      showInLegend: true
    });

    data.push({
      type: "column",
      color: "#325ea8",
      markerColor: "#325ea8",
      name: "Verbrauch",
      xValueFormatString: "DD.MM.YYYY",
      dataPoints: this.dayEntries?.map(entry => {
        var xDate = new Date(entry.lastupdated);
        xDate.setHours(0, 0, 0);
        return {
          x: xDate.getDate(),
          y: Math.round(((entry.usage / 1000) + Number.EPSILON) * 100) / 100,
          label: xDate.getDate().toString(),
          // toolTipContent: '<span style="color:#325ea8">Verbrauch</span>: ' + (entry.produced / 1000).toFixed(2) + 'kWH'
        }
      }) ?? new Array<CanvasJS.ChartDataPoint>(),
      legendText: "Verbrauch",
      showInLegend: true
    });
    let startLimit = new Date(month.getTime());
    startLimit.setDate(1);
    startLimit.setHours(0, 0, 0);

    //var pseudoEndLimit = new Date(month.getTime());
    var endLimit = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

    // var fuckingfuckendLimit = endLimit.getTime();

    this.monthChartOptions = {
      animationEnabled: true,
      title: {
      },
      backgroundColor: "#ffffff00",
      theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark2" : "light2",
      axisX: {
        // valueFormatString: "DD",
        // interval: 1,
        minimum: startLimit.getDate(),
        maximum: endLimit.getDate(),
      },
      axisY: {
        minimum: 0
      },
      toolTip: {
        shared: true,

      },
      data: data
    }
  }

  public renderYearChart(year: Date) {
    var data = new Array<ChartDataSeriesOptions>();
    data.push({
      type: "column",
      color: "#ffae00",
      markerColor: "#ffae00",
      name: "Production",
      xValueFormatString: "MMMM YYYY",
      dataPoints: this.monthEntries?.map(entry => {
        var xDate = new Date(entry.lastupdated);
        xDate.setHours(0, 0, 0);
        return {
          y: Math.round(((entry.produced / 1000) + Number.EPSILON) * 100) / 100,
          label: (xDate.getMonth() + 1).toString(),
          x: xDate.getMonth() + 1,
          // toolTipContent: '<span style="color:#ffae00">Produktion</span>: ' + (entry.produced / 1000).toFixed(2) + 'kWH'
        }
      }) ?? new Array<CanvasJS.ChartDataPoint>(),
      legendText: "Produktion",
      showInLegend: true
    });

    data.push({
      type: "column",
      color: "#325ea8",
      markerColor: "#325ea8",
      name: "Verbrauch",
      xValueFormatString: "MMMM YYYY",
      dataPoints: this.monthEntries?.map(entry => {
        var xDate = new Date(entry.lastupdated);
        xDate.setHours(0, 0, 0);
        return {
          y: Math.round(((entry.usage / 1000) + Number.EPSILON) * 100) / 100,
          x: xDate.getMonth() + 1,
          label: (xDate.getMonth() + 1).toString(),
          // toolTipContent: '<span style="color:#325ea8">Verbrauch</span>: ' + (entry.produced / 1000).toFixed(2) + 'kWH'
        }
      }) ?? new Array<CanvasJS.ChartDataPoint>(),
      legendText: "Verbrauch",
      showInLegend: true
    });
    let startLimit = new Date(year.getTime());
    startLimit.setMonth(0);
    startLimit.setDate(1);
    startLimit.setHours(0, 0, 0);

    let pseudoEndLimit = new Date(year.getTime());
    let endLimit = new Date(pseudoEndLimit.getFullYear() - 1, 12, 31, 23, 59, 59);


    this.yearChartOptions = {
      animationEnabled: true,
      title: {
      },
      dataPointWidth: 20,
      backgroundColor: "#ffffff00",
      theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark2" : "light2",
      axisX: {
        // valueFormatString: "MM",
        interval: 1,
        // intervalType: 'month',
        minimum: 1,
        maximum: 12,
      },
      axisY: {
        minimum: 0
      },
      toolTip: {
        shared: true,

      },
      data: data
    }
  }

  public renderTotalChart() {
    var data = new Array<ChartDataSeriesOptions>();
    data.push({
      type: "column",
      color: "#ffae00",
      markerColor: "#ffae00",
      name: "Production",
      xValueFormatString: "MMMM YYYY",
      dataPoints: this.yearEntries?.map(entry => {
        var xDate = new Date(entry.lastupdated);
        xDate.setHours(0, 0, 0);
        return {
          x: xDate.getFullYear(),
          y: Math.round(((entry.produced / 1000) + Number.EPSILON) * 100) / 100,
          label: xDate.getFullYear().toString(),
          // toolTipContent: '<span style="color:#ffae00">Produktion</span>: ' + (entry.produced / 1000).toFixed(2) + 'kWH'
        }
      }) ?? new Array<CanvasJS.ChartDataPoint>(),
      legendText: "Produktion",
      showInLegend: true
    });

    data.push({
      type: "column",
      color: "#325ea8",
      markerColor: "#325ea8",
      name: "Verbrauch",
      xValueFormatString: "MMMM YYYY",
      dataPoints: this.yearEntries?.map(entry => {
        var xDate = new Date(entry.lastupdated);
        xDate.setHours(0, 0, 0);
        return {
          x: xDate.getFullYear(),
          y: Math.round(((entry.usage / 1000) + Number.EPSILON) * 100) / 100,
          label: xDate.getFullYear().toString(),
          // toolTipContent: '<span style="color:#325ea8">Verbrauch</span>: ' + (entry.produced / 1000).toFixed(2) + 'kWH'
        }
      }) ?? new Array<CanvasJS.ChartDataPoint>(),
      legendText: "Verbrauch",
      showInLegend: true
    });

    this.totalChartOptions = {
      animationEnabled: true,
      title: {
      },
      culture: 'de',
      //dataPointWidth: 50,
      backgroundColor: "#ffffff00",
      theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark2" : "light2",
      axisX: {
        interval: 1,
        intervalType: 'year'
      },
      axisY: {
        minimum: 0
      },
      toolTip: {
        shared: true,

      },
      data: data
    }
  }

  public removeDay() {
    this.selectedDay.setDate(this.selectedDay.getDate() - 1);
    this.selectedDay = new Date(this.selectedDay.getTime());
    this.getHistory();
    this.getFullDay(this.selectedDay);
  }

  public addDay() {
    this.selectedDay.setDate(this.selectedDay.getDate() + 1);
    this.selectedDay = new Date(this.selectedDay.getTime())
    this.getHistory();
    this.getFullDay(this.selectedDay);
  }

  public async removeMonth() {
    this.selectedDay.setMonth(this.selectedDay.getMonth() - 1);
    this.selectedDay = new Date(this.selectedDay.getTime());
    this.getCurrentMonth();
    this.getFullMonth(this.selectedDay);
  }

  public async addMonth() {
    this.selectedDay.setMonth(this.selectedDay.getMonth() + 1);
    this.selectedDay = new Date(this.selectedDay.getTime());
    this.getCurrentMonth();
    this.getFullMonth(this.selectedDay);
  }

  public async removeYear() {
    this.selectedDay.setFullYear(this.selectedDay.getFullYear() - 1);
    this.selectedDay = new Date(this.selectedDay.getTime());
    this.yearEntry = await this.getCurrentYear();
    this.getFullYear(this.selectedDay);
  }

  public async addYear() {
    this.selectedDay.setFullYear(this.selectedDay.getFullYear() + 1);
    this.selectedDay = new Date(this.selectedDay.getTime());
    this.yearEntry = await this.getCurrentYear();
    this.getFullYear(this.selectedDay);
  }

  public async getHistory() {
    var date = Math.floor(this.selectedDay.getTime());
    var response = (await lastValueFrom(this.http.get(AppConfig.backendUrl + "/api/day/" + date))) as HistoryResponse;
    this.prodDataPoints = response.production.map(entry => { return { x: new Date(entry._time), y: entry._value, label: 'Production' } });
    this.usageDataPoints = response.usage.map(entry => { return { x: new Date(entry._time), y: entry._value, label: 'Usage' } });
    this.renderChart();
    this.loading = false;
  }

  public async getFullDay(date: Date) {
    this.http.get(AppConfig.backendUrl + '/api/fullday/' + date.getTime()).subscribe(response => {
      this.dayEntry = response as DayEntry;
    })
  }

  public async getFullMonth(date: Date) {
    this.dayEntries = await lastValueFrom(this.http.get(AppConfig.backendUrl + '/api/fullMonth/' + date.getTime())) as DayEntry[];
    this.renderMonthChart(date);
  }

  public async getFullYear(date: Date) {
    this.http.get(AppConfig.backendUrl + '/api/fullYear/' + date.getTime()).subscribe(response => {
      this.monthEntries = response as MonthEntry[];
      this.renderYearChart(date);
    })
  }

  public async getTotal() {
    this.http.get(AppConfig.backendUrl + '/api/total').subscribe(response => {
      this.yearEntries = response as YearEntry[];
      this.totalEntry = new TotalEntry(
        this.yearEntries.map(entry => entry.produced).reduce((a, b) => a + b, 0),
        this.yearEntries.map(entry => entry.consumption).reduce((a, b) => a + b, 0),
        this.yearEntries.map(entry => entry.delivery).reduce((a, b) => a + b, 0),
        this.yearEntries.map(entry => entry.usage).reduce((a, b) => a + b, 0),
      )
      this.renderTotalChart();
    })
  }

  ionViewDidEnter(): void {
    this.getHistory();
    this.getFullDay(this.selectedDay);
    this.refresher = setInterval(() => {
      this.getHistory();
      this.getFullDay(this.selectedDay);
    }, 30000)
  }

  ionViewDidLeave(): void {
    clearInterval(this.refresher);
  }

}
