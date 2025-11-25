import { Injectable } from '@angular/core';
import { Vehicle } from '../models/vehicle.model';

export interface Expense {
  id: string;
  vehicleId: string;
  amount: number;
  date: string; // ISO
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class MaintenanceService {
  private VEHICLES_KEY = 'mf_vehicles_v1';
  private EXPENSES_KEY = 'mf_expenses_v1';

  constructor() {}

  private uid() {
    return Math.random().toString(36).slice(2, 9);
  }

  // Vehicles
  getVehicles(): Vehicle[] {
    const raw = localStorage.getItem(this.VEHICLES_KEY);
    return raw ? JSON.parse(raw) as Vehicle[] : [];
  }

  saveVehicle(v: Vehicle) {
    const list = this.getVehicles();
    if (!v.id) {
      v.id = this.uid();
      list.push(v);
    } else {
      const idx = list.findIndex(x => x.id === v.id);
      if (idx > -1) list[idx] = v;
      else list.push(v);
    }
    localStorage.setItem(this.VEHICLES_KEY, JSON.stringify(list));
  }

  deleteVehicle(id: string) {
    const list = this.getVehicles().filter(v => v.id !== id);
    localStorage.setItem(this.VEHICLES_KEY, JSON.stringify(list));
    // remove related expenses
    const expenses = this.getExpenses().filter(e => e.vehicleId !== id);
    localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(expenses));
  }

  // Expenses
  getExpenses(): Expense[] {
    const raw = localStorage.getItem(this.EXPENSES_KEY);
    return raw ? JSON.parse(raw) as Expense[] : [];
  }

  addExpense(exp: Omit<Expense, 'id'>) {
    const e: Expense = { ...exp, id: this.uid() } as Expense;
    const list = this.getExpenses();
    list.push(e);
    localStorage.setItem(this.EXPENSES_KEY, JSON.stringify(list));
  }

  // Alerts: oil change overdue or upcoming (nextOilChange)
  getAlerts() {
    const vehicles = this.getVehicles();
    const now = new Date();
    const alerts: { vehicle: Vehicle; type: string; info: string }[] = [];
    for (const v of vehicles) {
      if (v.nextOilChange) {
        const next = new Date(v.nextOilChange);
        const diff = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        if (diff <= 0) {
          alerts.push({ vehicle: v, type: 'oil-overdue', info: 'Cambio de aceite vencido' });
        } else if (diff <= 7) {
          alerts.push({ vehicle: v, type: 'oil-soon', info: 'Cambio de aceite en menos de 7 días' });
        }
      }
      // simple mileage alert could be added depending on stored mileage
    }
    return alerts;
  }

  // Stats: monthly totals from expenses
  getMonthlyStats() {
    const expenses = this.getExpenses();
    const map: { [key: string]: number } = {};
    for (const e of expenses) {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      map[key] = (map[key] || 0) + e.amount;
    }
    // convert to array
    return Object.keys(map).sort().map(k => ({ month: k, total: map[k] }));
  }
}
