/*
CanvasJS Angular Charts - https://canvasjs.com/
Copyright 2023 fenopix

--------------------- License Information --------------------
CanvasJS is a commercial product which requires purchase of license. Without a commercial license you can use it for evaluation purposes for upto 30 days. Please refer to the following link for further details.
https://canvasjs.com/license/

*/
/*tslint:disable*/
/*eslint-disable*/
/*jshint ignore:start*/
import { Component, AfterViewInit, OnChanges, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Chart } from 'canvasjs';
declare var require: any;
var CanvasJS = require('./canvasjs.min');

@Component({
	standalone: true,
	selector: 'canvasjs-chart',
	template: '<div id="{{chartContainerId}}" class="custom-container-class"></div>',
	styles: ['.custom-container-class {height: 100%;}']
})

class CanvasJSChart implements AfterViewInit, OnChanges, OnDestroy {
	static _cjsChartContainerId = 0;
	public chart: any;
	chartContainerId: any;
	prevChartOptions: any;
	shouldUpdateChart = false;

	@Input()
	options: any;
	@Input()
	styles: any;

	@Output()
	chartInstance = new EventEmitter<object>();

	constructor() {
		this.options = this.options ? this.options : {};
		this.styles = this.styles ? this.styles : { width: "100%", height: "100%", position: "relative" };
		this.styles.height = this.options.height ? this.options.height + "px" : "400px";

		this.chartContainerId = 'canvasjs-angular-chart-container-' + CanvasJSChart._cjsChartContainerId++;
	}

	ngDoCheck() {
		if (this.prevChartOptions != this.options) {
			this.shouldUpdateChart = true;
			if (this.chart) {
				this.chart.options = this.options;
				this.chart.render();
				this.shouldUpdateChart = false;
				this.prevChartOptions = this.options;
			}
		}
	}

	ngOnChanges() {
		//Update Chart Options & Render
		if (this.shouldUpdateChart && this.chart) {
			this.chart.options = this.options;
			this.chart.render();
			this.shouldUpdateChart = false;
			this.prevChartOptions = this.options;
		}
	}

	ngAfterViewInit() {
		this.chart = new CanvasJS.Chart(this.chartContainerId, this.options);
		this.chart.render();
		this.prevChartOptions = this.options;
		this.chartInstance.emit(this.chart);
	}

	ngOnDestroy() {
		if (this.chart)
			this.chart.destroy();
	}
}

export {
	CanvasJSChart,
	CanvasJS
};
/*tslint:enable*/
/*eslint-enable*/
/*jshint ignore:end*/