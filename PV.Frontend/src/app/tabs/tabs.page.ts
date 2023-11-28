import { APP_INITIALIZER, Component, EnvironmentInjector, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { NotificationService } from '../services/notification.service';
import { AppConfigService } from '../services/appConfig.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [IonicModule],
  providers: [NotificationService]
})
export class TabsPage {
  public environmentInjector = inject(EnvironmentInjector);

  constructor(private notService: NotificationService) {
    this.notService.initPush();
  }
}
