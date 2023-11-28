import { Component, OnInit, Input, OnDestroy, HostBinding } from '@angular/core';
import { Observable, timer, takeWhile, map, merge } from 'rxjs';

@Component({
    selector: 'app-blink',
    template: `<ng-content></ng-content>`,
    standalone: true
})
export class BlinkComponent implements OnInit, OnDestroy {
    private blinker$: Observable<string>;

    @Input() active: boolean = true;
    @Input() visibleMS: number = 0;
    @Input() inVisibleMS: number = 1000;
    @Input() totalMS: number = 2000;

    @HostBinding('style.visibility')
    private visibility: string = "";

    constructor() {
        // Visible for 750 ms and then invisible for 250 ms, for a total period of 1 second.
        timer
        const show$ = timer(this.visibleMS, this.totalMS);
        const hide$ = timer(this.inVisibleMS, this.totalMS);

        this.blinker$ = merge(
            show$.pipe(map(() => 'visible')),
            hide$.pipe(map(() => 'hidden'))
        );
    }

    ngOnInit() {
        this.blinker$
            .pipe(
                takeWhile(() => this.active)
            )
            .subscribe((newVisibility: string) => this.visibility = newVisibility);
    }

    ngOnDestroy() {
        this.active = false;
    }

}