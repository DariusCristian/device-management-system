import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Device, DeviceService } from '../../services/device';

@Component({
  selector: 'app-device-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './device-list.html',
  styleUrl: './device-list.css',
})
export class DeviceList implements OnInit {
  private readonly deviceService = inject(DeviceService);
  private readonly cdr = inject(ChangeDetectorRef);

  devices: Device[] = [];
  isLoading = false;
  errorMessage = '';
  selectedDevice: Device | null = null;
  isEditMode = false;
  currentUser: any = null;

  newDevice: Device = {
    id: 0,
    name: '',
    manufacturer: '',
    type: '',
    operatingSystem: '',
    osVersion: '',
    processor: '',
    ramAmount: 0,
    description: '',
    assignedUserId: null,
  };

  ngOnInit(): void {
    const savedUser = localStorage.getItem('currentUser');

    if (!savedUser) {
      this.errorMessage = 'You must be logged in to access devices.';
      return;
    }

    this.currentUser = JSON.parse(savedUser);
    this.loadDevices();
  }

  loadDevices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.deviceService
      .getDevices()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (devices) => {
          this.devices = devices;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Device load error:', error);
          this.errorMessage = 'Failed to load devices.';
          this.cdr.detectChanges();
        },
      });
  }

  selectDevice(device: Device): void {
    this.selectedDevice = device;
    this.newDevice = { ...device };
    this.isEditMode = true;
  }

  createDevice(): void {
    if (
      !this.newDevice.name.trim() ||
      !this.newDevice.manufacturer.trim() ||
      !this.newDevice.type.trim() ||
      !this.newDevice.operatingSystem.trim() ||
      !this.newDevice.osVersion.trim() ||
      !this.newDevice.processor.trim() ||
      !this.newDevice.description.trim() ||
      this.newDevice.ramAmount <= 0
    ) {
      this.errorMessage = 'All fields are required and RAM must be greater than 0.';
      return;
    }

    const alreadyExists = this.devices.some(
      (device) =>
        device.name.toLowerCase() === this.newDevice.name.toLowerCase() &&
        device.manufacturer.toLowerCase() === this.newDevice.manufacturer.toLowerCase()
    );

    if (alreadyExists) {
      this.errorMessage = 'A device with the same name and manufacturer already exists.';
      return;
    }

    this.deviceService.createDevice(this.newDevice).subscribe({
      next: () => {
        this.errorMessage = '';
        this.newDevice = {
          id: 0,
          name: '',
          manufacturer: '',
          type: '',
          operatingSystem: '',
          osVersion: '',
          processor: '',
          ramAmount: 0,
          description: '',
          assignedUserId: null,
        };
        this.loadDevices();
      },
      error: (error) => {
        console.error('Create device error:', error);
        this.errorMessage = 'Failed to create device.';
      },
    });
  }

  updateDevice(): void {
    if (
      !this.newDevice.name.trim() ||
      !this.newDevice.manufacturer.trim() ||
      !this.newDevice.type.trim() ||
      !this.newDevice.operatingSystem.trim() ||
      !this.newDevice.osVersion.trim() ||
      !this.newDevice.processor.trim() ||
      !this.newDevice.description.trim() ||
      this.newDevice.ramAmount <= 0
    ) {
      this.errorMessage = 'All fields are required and RAM must be greater than 0.';
      return;
    }

    this.deviceService.updateDevice(this.newDevice.id, this.newDevice).subscribe({
      next: () => {
        this.errorMessage = '';
        this.selectedDevice = null;
        this.isEditMode = false;
        this.newDevice = {
          id: 0,
          name: '',
          manufacturer: '',
          type: '',
          operatingSystem: '',
          osVersion: '',
          processor: '',
          ramAmount: 0,
          description: '',
          assignedUserId: null,
        };
        this.loadDevices();
      },
      error: (error) => {
        console.error('Update device error:', error);
        this.errorMessage = 'Failed to update device.';
      },
    });
  }
  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedDevice = null;
    this.errorMessage = '';
    this.newDevice = {
      id: 0,
      name: '',
      manufacturer: '',
      type: '',
      operatingSystem: '',
      osVersion: '',
      processor: '',
      ramAmount: 0,
      description: '',
      assignedUserId: null,
    };
  }

  deleteDevice(id: number): void {
    this.deviceService.deleteDevice(id).subscribe({
      next: () => {
        if (this.selectedDevice?.id === id) {
          this.cancelEdit();
        }
        this.errorMessage = '';
        this.loadDevices();
      },
      error: (error) => {
        console.error('Delete device error:', error);
        this.errorMessage = 'Failed to delete device.';
      },
    });
  }
  isAssignedToCurrentUser(device: Device): boolean {
    return !!this.currentUser && device.assignedUserId === this.currentUser.id;
  }

  canAssignToCurrentUser(device: Device): boolean {
    return !!this.currentUser && !device.assignedUserId;
  }

  assignToMe(device: Device): void {
    if (!this.currentUser) {
      this.errorMessage = 'You must be logged in.';
      return;
    }

    if (device.assignedUserId) {
      this.errorMessage = 'This device is already assigned.';
      return;
    }

    const updatedDevice: Device = {
      ...device,
      assignedUserId: this.currentUser.id,
    };

    this.deviceService.updateDevice(device.id, updatedDevice).subscribe({
      next: () => {
        this.errorMessage = '';
        this.loadDevices();
      },
      error: (error) => {
        console.error('Assign device error:', error);
        this.errorMessage = 'Failed to assign device.';
      },
    });
  }

  unassignFromMe(device: Device): void {
    if (!this.currentUser) {
      this.errorMessage = 'You must be logged in.';
      return;
    }

    if (device.assignedUserId !== this.currentUser.id) {
      this.errorMessage = 'You can only unassign your own device.';
      return;
    }

    const updatedDevice: Device = {
      ...device,
      assignedUserId: null,
    };

    this.deviceService.updateDevice(device.id, updatedDevice).subscribe({
      next: () => {
        this.errorMessage = '';
        this.loadDevices();
      },
      error: (error) => {
        console.error('Unassign device error:', error);
        this.errorMessage = 'Failed to unassign device.';
      },
    });
  }
}
