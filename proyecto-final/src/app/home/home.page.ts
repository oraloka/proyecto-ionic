import { Component, OnInit, OnDestroy, ViewChild, ElementRef, EnvironmentInjector, runInInjectionContext, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface Production {
  id?: string;
  date: string;
  productType: string;
  quantity: number;
  cost: number;
  income: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('productionChart') productionChartRef?: ElementRef<HTMLCanvasElement>;
  chart?: Chart;

  // Production data
  productions: Production[] = [];
  filteredProductions: Production[] = [];
  newProduction: Production = { date: '', productType: '', quantity: 0, cost: 0, income: 0 };
  saving = false;

  // Summary stats
  totalProduction = 0;
  totalIncome = 0;
  totalCost = 0;
  netProfit = 0;

  // Filters
  filterStartDate = '';
  filterEndDate = '';
  filterProductType = '';
  private STORAGE_KEY = 'production_records_v1';
  private userUid: string | null = null;
  private authSub?: Subscription;

  constructor(
    private afAuth: AngularFireAuth,
    private toastCtrl: ToastController,
    private router: Router,
    private afs: AngularFirestore,
    private envInjector: EnvironmentInjector,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeToday();
  }

  private initializeToday() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.newProduction.date = `${year}-${month}-${day}`;
  }

  ngOnInit() {
    this.loadProductions();
    this.authSub = this.afAuth.authState.subscribe(user => {
      if (user) {
        this.userUid = user.uid;
        this.loadProductions();
      } else {
        this.userUid = null;
        this.productions = [];
        this.filteredProductions = [];
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    this.renderChart();
  }

  ngOnDestroy() {
    if (this.chart) this.chart.destroy();
    if (this.authSub) this.authSub.unsubscribe();
  }

  private loadProductions() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY) || '[]';
      this.productions = JSON.parse(raw);
      this.applyFilters();
      this.updateStats();
      this.renderChart();
    } catch (e) {
      console.error('Error loading productions', e);
      this.productions = [];
    }
  }

  private saveProductions() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.productions));
    } catch (e) {
      console.error('Error saving productions', e);
    }
  }

  async addProduction(event?: Event) {
    try { event?.preventDefault(); } catch {}

    if (!this.newProduction.date || !this.newProduction.productType || !this.newProduction.quantity || this.newProduction.quantity <= 0 || this.newProduction.cost < 0 || this.newProduction.income < 0) {
      const toast = await this.toastCtrl.create({ message: 'Completa todos los campos correctamente', duration: 2000, color: 'warning' });
      toast.present();
      return;
    }

    this.saving = true;
    try {
      const newRec: Production = { ...this.newProduction, id: Date.now().toString() };
      this.productions.push(newRec);
      this.saveProductions();
      this.applyFilters();
      this.updateStats();
      this.renderChart();
      const toast = await this.toastCtrl.create({ message: 'Producción registrada', duration: 2000, color: 'success' });
      toast.present();
      this.initializeToday();
      this.newProduction = { date: this.newProduction.date, productType: '', quantity: 0, cost: 0, income: 0 };
    } catch (err: any) {
      const toast = await this.toastCtrl.create({ message: err.message || 'Error al registrar', duration: 3000, color: 'danger' });
      toast.present();
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }

  async deleteProduction(id?: string) {
    if (!id) return;
    try {
      this.productions = this.productions.filter(p => p.id !== id);
      this.saveProductions();
      this.applyFilters();
      this.updateStats();
      this.renderChart();
      const toast = await this.toastCtrl.create({ message: 'Registro eliminado', duration: 2000, color: 'medium' });
      toast.present();
    } catch (err: any) {
      const toast = await this.toastCtrl.create({ message: err.message || 'Error al eliminar', duration: 3000, color: 'danger' });
      toast.present();
    }
  }

  applyFilters() {
    this.filteredProductions = this.productions.filter(p => {
      const pDate = new Date(p.date);
      const startOk = !this.filterStartDate || pDate >= new Date(this.filterStartDate);
      const endOk = !this.filterEndDate || pDate <= new Date(this.filterEndDate);
      const typeOk = !this.filterProductType || p.productType === this.filterProductType;
      return startOk && endOk && typeOk;
    });
    this.updateStats();
    this.renderChart();
  }

  private updateStats() {
    this.totalProduction = this.filteredProductions.reduce((sum, p) => sum + (p.quantity || 0), 0);
    this.totalIncome = this.filteredProductions.reduce((sum, p) => sum + (p.income || 0), 0);
    this.totalCost = this.filteredProductions.reduce((sum, p) => sum + (p.cost || 0), 0);
    this.netProfit = this.totalIncome - this.totalCost;
    this.cdr.detectChanges();
  }

  private renderChart() {
    if (!this.productionChartRef) return;
    if (this.chart) this.chart.destroy();

    // Group by month
    const monthData: { [key: string]: number } = {};
    this.filteredProductions.forEach(p => {
      const date = new Date(p.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthData[monthKey] = (monthData[monthKey] || 0) + (p.quantity || 0);
    });

    const labels = Object.keys(monthData).sort();
    const data = labels.map(k => monthData[k]);

    const ctx = this.productionChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels.map(m => m.replace('-', '/')),
        datasets: [
          {
            label: 'Producción (kg/l)',
            data: data,
            backgroundColor: '#1b5e75',
            borderColor: '#0d3a47',
            borderWidth: 2,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: true, position: 'top' }, tooltip: { mode: 'index', intersect: false } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Cantidad (kg/l)' } }, x: { title: { display: true, text: 'Período' } } }
      }
    });
  }

  async onLogout() {
    await runInInjectionContext(this.envInjector, async () => await this.afAuth.signOut());
    const toast = await this.toastCtrl.create({ message: 'Sesión cerrada', duration: 2000, color: 'primary' });
    toast.present();
    this.router.navigate(['/login']);
  }

}


