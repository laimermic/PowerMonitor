import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { EnergyWithCost } from '../models/EnergyWithCost';
import { DayEntry } from '../models/DayEntry';
import { EnergyPrice } from '../models/EnergyPrice';
import { FindPricePipe } from '../pipes/find-price.pipe';
import { SumMoneyPipe } from '../pipes/sum-money.pipe';

@Component({
  selector: 'app-yields-details',
  templateUrl: './yields-details.page.html',
  styleUrls: ['./yields-details.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, FindPricePipe, SumMoneyPipe],
})
export class YieldsDetailsPage implements OnInit {

  public costs: { [key: string]: EnergyWithCost } = {};
  public income: { [key: string]: EnergyWithCost } = {};
  public savedCosts: { [key: string]: EnergyWithCost } = {};

  public dayEntries: Array<DayEntry> = new Array<DayEntry>();
  public prices: Array<EnergyPrice> = new Array<EnergyPrice>();

  constructor(private modalCtrl: ModalController, private navParams: NavParams) { }

  public calcYield(start: Date, end: Date) {
    this.income = {};
    this.costs = {};
    this.savedCosts = {};
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    let usedEntries = this.dayEntries.filter(e => e.lastupdated >= start.getTime() && e.lastupdated <= end.getTime());
    console.log(usedEntries)
    usedEntries.forEach(e => {
      let consumptionPrice = this.prices?.find(p => p.type == 'consume' && (p.start == null || p.start <= e.lastupdated) && (p.end == null || p.end >= e.lastupdated));
      if (consumptionPrice) {
        if (this.costs[consumptionPrice._id ?? 'undefined'] == undefined) {
          this.costs[consumptionPrice._id ?? 'undefined'] = new EnergyWithCost(e.consumption, (e.consumption / 1000) * consumptionPrice.pricePerKwH);
        } else {
          this.costs[consumptionPrice._id ?? 'undefined'].energy += e.consumption;
          this.costs[consumptionPrice._id ?? 'undefined'].cost += (e.consumption / 1000) * consumptionPrice.pricePerKwH;
        }
      }
      let feedInPrice = this.prices?.find(p => p.type == 'feed' && (p.start == null || p.start <= e.lastupdated) && (p.end == null || p.end >= e.lastupdated));
      if (feedInPrice) {
        if (this.income[feedInPrice._id ?? 'undefined'] == undefined) {
          this.income[feedInPrice._id ?? 'undefined'] = new EnergyWithCost(e.delivery, (e.delivery / 1000) * feedInPrice.pricePerKwH);
        } else {
          this.income[feedInPrice._id ?? 'undefined'].energy += e.delivery;
          this.income[feedInPrice._id ?? 'undefined'].cost += (e.delivery / 1000) * feedInPrice.pricePerKwH;
        }
      }
    });
  }

  public close() {
    this.modalCtrl.dismiss();
  }

  ngOnInit() {
    this.dayEntries = this.navParams.get('dayEntries');
    this.prices = this.navParams.get('prices');
    let start = new Date(this.navParams.get('start'));
    let end = new Date(this.navParams.get('end'));
    this.calcYield(start, end);
  }
}
