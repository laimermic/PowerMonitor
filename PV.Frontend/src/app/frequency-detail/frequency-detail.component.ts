import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { BlinkComponent } from 'src/assets/blink.component';
import { CanvasJSChart } from 'src/assets/canvasjs.angular.component';
import { InfluxResult } from '../models/InfluxResult';
import { ChartDataPoint } from 'canvasjs';

@Component({
  selector: 'app-frequency-detail',
  templateUrl: './frequency-detail.component.html',
  styleUrls: ['./frequency-detail.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule, CanvasJSChart, BlinkComponent],
})
export class FrequencyDetailComponent implements OnInit {
  public start: number = 0;
  public end: number = 0;
  public filteredPoints: InfluxResult[] = new Array<InfluxResult>();
  public graphOptions: CanvasJS.ChartOptions = {
    title: {},
    data: []
  };

  public frequencyDataPoints: Array<ChartDataPoint> = new Array<ChartDataPoint>();

  constructor(private modalCtrl: ModalController, private navParams: NavParams) { }

  public close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {
    this.start = this.navParams.get('start');
    this.end = this.navParams.get('end');
    let allPoints: InfluxResult[] = this.navParams.get('points');
    this.filteredPoints = allPoints.filter(p => new Date(p._time).getTime() >= this.start && new Date(p._time).getTime() <= this.end);
    this.frequencyDataPoints = this.filteredPoints.map(point => { return { x: new Date(point._time), y: Math.round((point._value + Number.EPSILON) * 100) / 100 } });

    this.graphOptions = {
      animationEnabled: true,
      title: {},
      backgroundColor: "#ffffff00",
      theme: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? "dark2" : "light2",
      axisX: {
        valueFormatString: "HH:mm",
        minimum: this.start,
        maximum: this.end,
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

}
