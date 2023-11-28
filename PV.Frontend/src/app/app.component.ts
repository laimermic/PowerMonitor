import { APP_INITIALIZER, Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AppConfig } from './models/AppConfig';
import { AppConfigService } from './services/appConfig.service';



const getBackendUrl = () => {
  return AppConfig.backendUrl;
};
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class AppComponent {
  public environmentInjector = inject(EnvironmentInjector);

  constructor() {

  }
}
