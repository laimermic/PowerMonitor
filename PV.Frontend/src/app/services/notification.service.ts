import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Token } from "@angular/compiler";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Capacitor } from "@capacitor/core";
import { ActionPerformed, PushNotification, PushNotificationActionPerformed, PushNotificationSchema, PushNotificationToken, PushNotifications } from "@capacitor/push-notifications";
import { NotificationClient } from "../models/NotifcationClient";
import { AppConfig } from "../models/AppConfig";

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    constructor(private router: Router, private http: HttpClient) {

    }

    public initPush() {
        if (Capacitor.getPlatform() == 'android') {
            this.registerPush();
        }
    }

    private registerPush() {
        PushNotifications.requestPermissions().then((permission) => {
            if (permission.receive == 'granted') {
                PushNotifications.register();
            } else {

            }
        })

        PushNotifications.addListener(
            'registration',
            (token: PushNotificationToken) => {
                console.log('My token: ' + JSON.stringify(token));
                var body: NotificationClient = {
                    token: token.value
                }
                this.http.post(AppConfig.backendUrl + "/api/registerNotification", body).subscribe((response) => {
                    console.log("Successfully registered NotificationClient: " + response)
                }, (error: HttpErrorResponse) => {
                    console.log("Error when registering NotificationClient: " + JSON.stringify(error));
                })
            }
        );
        PushNotifications.addListener('registrationError', (error: any) => {
            console.log('Error: ' + JSON.stringify(error));
        });

        PushNotifications.addListener(
            'pushNotificationReceived',
            async (notification: PushNotificationSchema) => {
                console.log('Push received: ' + JSON.stringify(notification));
            }
        );

        PushNotifications.addListener(
            'pushNotificationActionPerformed',
            async (notification: ActionPerformed) => {
                //const data = notification.notification.data;
                console.log('Action performed: ' + JSON.stringify(notification.notification));
                /*if (data.detailsId) {
                    this.router.navigateByUrl(`/PV/${data.detailsId}`);
                }*/
            }
        );
    }
}