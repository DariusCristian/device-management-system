import { Component } from '@angular/core';
import { DeviceList } from './components/device-list/device-list';

@Component({
  selector: 'app-root',
  imports: [DeviceList],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
