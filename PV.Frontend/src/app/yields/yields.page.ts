import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-yields',
  templateUrl: './yields.page.html',
  styleUrls: ['./yields.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class YieldsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
