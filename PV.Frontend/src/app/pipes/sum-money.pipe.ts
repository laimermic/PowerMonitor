import { Pipe, PipeTransform } from '@angular/core';
import { EnergyWithCost } from '../models/EnergyWithCost';

@Pipe({
  name: 'sumMoney',
  standalone: true
})
export class SumMoneyPipe implements PipeTransform {

  transform(value: { [key: string]: EnergyWithCost }): number {
    var total = 0;
    Object.values(value).forEach(e => {
      total += e.cost;
    });
    return total;
  }

}
