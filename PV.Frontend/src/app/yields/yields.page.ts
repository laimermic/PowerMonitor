import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ViewDidEnter, ViewDidLeave } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AppConfig } from '../models/AppConfig';
import { EnergyPrice } from '../models/EnergyPrice';
import { DayEntry } from '../models/DayEntry';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-yields',
  templateUrl: './yields.page.html',
  styleUrls: ['./yields.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class YieldsPage implements ViewDidEnter, ViewDidLeave {

  public prices: Array<EnergyPrice> | null = null;
  public dayEntries: Array<DayEntry> = [];
  public pricesModalOpen: boolean = false;

  public newPrice: EnergyPrice = new EnergyPrice(null, null, 'consume', 0);

  public newPriceStart: string = new Date().toISOString();
  public newPriceEnd: string = new Date().toISOString();
  public currentView = 'today';

  public refresher: any;

  public income: number = 0;
  public costs: number = 0;

  public calculatedDelivery: number = 0;
  public calculatedConsumption: number = 0;

  constructor(private http: HttpClient) { }

  public calcYield() {
    let start = new Date();
    let end = new Date();
    switch (this.currentView) {
      case 'today':
        start = new Date();
        end = new Date();
        break;

      case 'month':
        let monthStart = new Date();
        monthStart.setDate(1);

        let monthEnd = new Date();
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);

        start = monthStart;
        end = monthEnd;
        break;
      case 'year':
        let yearStart = new Date();
        yearStart.setMonth(0);
        yearStart.setDate(1);

        let yearEnd = new Date();
        yearEnd.setMonth(11);
        yearEnd.setDate(31);

        start = yearStart;
        end = yearEnd;
        break;
      default:
        break;
    }
    this.income = 0;
    this.costs = 0;
    this.calculatedDelivery = 0;
    this.calculatedConsumption = 0;
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    let usedEntries = this.dayEntries.filter(e => e.lastupdated >= start.getTime() && e.lastupdated <= end.getTime());
    console.log(usedEntries)
    usedEntries.forEach(e => {
      let consumptionPrice = this.prices?.find(p => p.type == 'consume' && (p.start == null || p.start <= e.lastupdated) && (p.end == null || p.end >= e.lastupdated));
      if (consumptionPrice) {
        this.costs += (e.consumption / 1000) * consumptionPrice.pricePerKwH;
        this.calculatedConsumption += e.consumption;
      }
      let feedInPrice = this.prices?.find(p => p.type == 'feed' && (p.start == null || p.start <= e.lastupdated) && (p.end == null || p.end >= e.lastupdated));
      if (feedInPrice) {
        this.income += (e.delivery / 1000) * feedInPrice.pricePerKwH;
        this.calculatedDelivery += e.delivery;
      }
    });
  }

  public changeView(ev: any) {
    this.currentView = ev.detail.value;
    this.calcYield();
  }

  public cancel() {
    this.pricesModalOpen = false;
  }

  public save() {
    let newPriceStart = new Date(this.newPriceStart)
    newPriceStart.setHours(0, 0, 0, 0);

    let newPriceEnd = new Date(this.newPriceEnd)
    newPriceEnd.setHours(23, 59, 59, 999);

    this.newPrice.start = newPriceStart.getTime();
    this.newPrice.end = newPriceEnd.getTime();
    if (this.newPrice.start >= this.newPrice.end) {
      alert('Startdatum muss vor Enddatum liegen');
      return;
    }
    let httpHeaders = new HttpHeaders();
    httpHeaders = httpHeaders.set('Content-Type', 'application/json');
    this.http.post(AppConfig.backendUrl + '/api/createElectricyPrice', this.newPrice, { headers: httpHeaders }).subscribe(async () => {
      this.pricesModalOpen = false;
      await this.getPricesAndEntries();
    });
  }

  public async getPricesAndEntries() {
    this.prices = (await lastValueFrom(this.http.get(AppConfig.backendUrl + '/api/electricityPrices'))) as Array<EnergyPrice>;
    this.dayEntries = (await lastValueFrom(this.http.get(AppConfig.backendUrl + '/api/allDays'))) as Array<DayEntry>;
    this.calcYield();
  }

  async ionViewDidEnter(): Promise<void> {
    await this.getPricesAndEntries();
    this.refresher = setInterval(async () => {
      await this.getPricesAndEntries();
    }, 10000);
  }

  ionViewDidLeave() {
    clearInterval(this.refresher);
  }

}
