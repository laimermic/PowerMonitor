import { Pipe, PipeTransform } from '@angular/core';
import { EnergyPrice } from '../models/EnergyPrice';

@Pipe({
  name: 'findPrice',
  standalone: true
})
export class FindPricePipe implements PipeTransform {

  transform(value: string, prices: EnergyPrice[]): EnergyPrice | undefined {
    return prices.find(p => p._id == value)
  }

}
