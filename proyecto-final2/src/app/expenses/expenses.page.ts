import { Component, OnInit } from '@angular/core';
import { MaintenanceService, Expense } from '../services/maintenance.service';

@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.page.html',
  styleUrls: ['./expenses.page.scss'],
})
export class ExpensesPage implements OnInit {
  expenses: Expense[] = [];
  vehicles: any[] = [];

  // simple form
  form: any = { vehicleId: '', amount: 0, date: new Date().toISOString(), description: '' };

  constructor(private svc: MaintenanceService) {}

  ngOnInit() {
    this.load();
  }

  ionViewWillEnter() { this.load(); }

  load() {
    this.expenses = this.svc.getExpenses();
    this.vehicles = this.svc.getVehicles();
  }

  add() {
    if (!this.form.vehicleId || !this.form.amount) return;
    this.svc.addExpense({ vehicleId: this.form.vehicleId, amount: +this.form.amount, date: this.form.date, description: this.form.description });
    this.form.amount = 0; this.form.description = '';
    this.load();
  }
}
