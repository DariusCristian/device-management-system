import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Device, DeviceService } from '../../services/device';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-device-list',
  imports: [CommonModule],
  templateUrl: './device-list.html',
  styleUrl: './device-list.css',
})
export class DeviceList implements OnInit {
  private readonly deviceService = inject(DeviceService);
  private readonly cdr = inject(ChangeDetectorRef);

  devices: Device[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDevices();
  }

  loadDevices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.deviceService.getDevices()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (devices) => {
          console.log('Devices received:', devices);
          this.devices = devices;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Device load error:', error);
          this.errorMessage = 'Failed to load devices.';
          this.cdr.detectChanges();
        }
      });
  }
}
