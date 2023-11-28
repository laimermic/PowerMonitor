import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { AppConfig } from '../models/AppConfig';

@Injectable()
export class AppConfigService {
  private http: HttpClient;
  constructor(_http: HttpClient) {
    this.http = _http;
  }

  public loadAppConfig() {
    return this.http.get('/assets/appConfig.json')
      .pipe(
        tap(configuration => {
          Object.assign(AppConfig, configuration);
        })
      ).toPromise();
  }
}