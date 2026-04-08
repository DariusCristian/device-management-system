import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Device, DeviceService } from '../../services/device';

type CurrentUser = {
  id: number;
  name: string;
  email?: string;
};

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './device-list.html',
  styleUrl: './device-list.css',
})
export class DeviceList implements OnInit {
  private readonly deviceService = inject(DeviceService);
  private readonly cdr = inject(ChangeDetectorRef);

  devices: Device[] = [];
  isLoading = false;
  isGeneratingDescription = false;
  isSavingDevice = false;
  errorMessage = '';
  selectedDevice: Device | null = null;
  isEditMode = false;
  currentUser: CurrentUser | null = null;
  searchQuery = '';
  isSearchMode = false;

  newDevice: Device = this.createEmptyDevice();

  ngOnInit(): void {
    const savedUser = localStorage.getItem('currentUser');

    if (!savedUser) {
      this.errorMessage = 'You must be logged in to access devices.';
      return;
    }

    this.currentUser = JSON.parse(savedUser) as CurrentUser;
    this.loadDevices();
  }

  private createEmptyDevice(): Device {
    return {
      id: 0,
      name: '',
      manufacturer: '',
      type: '',
      operatingSystem: '',
      osVersion: '',
      processor: '',
      ramAmount: null,
      description: '',
      assignedUserId: null,
    };
  }

  private hasInvalidDeviceFields(device: Device): boolean {
    return (
      !device.name.trim() ||
      !device.manufacturer.trim() ||
      !device.type.trim() ||
      !device.operatingSystem.trim() ||
      !device.osVersion.trim() ||
      !device.processor.trim() ||
      !device.description.trim() ||
      !device.ramAmount ||
      device.ramAmount <= 0
    );
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
    if (this.hasInvalidDeviceFields(this.newDevice)) {
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

    this.isSavingDevice = true;
    this.errorMessage = '';

    this.deviceService
      .createDevice(this.newDevice)
      .pipe(
        finalize(() => {
          this.isSavingDevice = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.newDevice = this.createEmptyDevice();
          this.loadDevices();
        },
        error: (error) => {
          console.error('Create device error:', error);
          this.errorMessage = 'Failed to create device.';
        },
      });
  }

  updateDevice(): void {
    if (this.hasInvalidDeviceFields(this.newDevice)) {
      this.errorMessage = 'All fields are required and RAM must be greater than 0.';
      return;
    }

    this.isSavingDevice = true;
    this.errorMessage = '';

    this.deviceService
      .updateDevice(this.newDevice.id, this.newDevice)
      .pipe(
        finalize(() => {
          this.isSavingDevice = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.errorMessage = '';
          this.selectedDevice = null;
          this.isEditMode = false;
          this.newDevice = this.createEmptyDevice();
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
    this.newDevice = this.createEmptyDevice();
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

  generateDescription(): void {
    this.errorMessage = '';
    this.isGeneratingDescription = true;

    const payload = {
      name: this.newDevice.name,
      manufacturer: this.newDevice.manufacturer,
      type: this.newDevice.type,
      operatingSystem: this.newDevice.operatingSystem,
      osVersion: this.newDevice.osVersion,
      processor: this.newDevice.processor,
      ramAmount: this.newDevice.ramAmount,
    };

    if (
      !payload.name.trim() ||
      !payload.manufacturer.trim() ||
      !payload.type.trim() ||
      !payload.operatingSystem.trim() ||
      !payload.osVersion.trim() ||
      !payload.processor.trim() ||
      !payload.ramAmount ||
      payload.ramAmount <= 0
    ) {
      this.errorMessage = 'Fill in all technical fields before generating a description.';
      this.isGeneratingDescription = false;
      return;
    }

    fetch('http://localhost:5125/api/Ai/generate-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to generate description.');
        }
        return response.json();
      })
      .then((data) => {
        this.newDevice.description = data.description;
        this.errorMessage = '';
        this.isGeneratingDescription = false;
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error('Generate description error:', error);
        this.errorMessage = error?.message || 'Failed to generate description.';
        this.isGeneratingDescription = false;
        this.cdr.detectChanges();
      });
  }

  onSearchInputChange(): void {
    if (!this.searchQuery.trim()) {
      this.isSearchMode = false;
      this.loadDevices();
    }
  }

  searchDevices(): void {
    const query = this.searchQuery.trim();

    if (!query) {
      this.isSearchMode = false;
      this.loadDevices();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.isSearchMode = true;

    this.deviceService
      .searchDevices(query)
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
          console.error('Device search error:', error);
          this.errorMessage = 'Failed to search devices.';
          this.cdr.detectChanges();
        },
      });
  }
}
