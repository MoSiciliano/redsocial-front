import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, ViewChildren, QueryList } from '@angular/core'; // <--- 1. IMPORTAR ViewChildren y QueryList
import { ModalService } from '../../services/modal.service';
import { environment } from '../../../enviroments/enviroment.prod';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Asegúrate de que sea standalone
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);

  // 2. AGREGAR ESTO: Nos permite controlar los gráficos desde el código
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  apiUrl = environment.apiUrl;
  users: any[] = [];
  totalComments: number = 0;

  // --- Configuración Barras ---
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Posts Publicados',
        backgroundColor: '#42A5F5',
        barPercentage: 0.5,
        categoryPercentage: 0.8,
      },
    ],
  };
  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };

  // --- Configuración Torta ---
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ data: [] }],
  };
  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
  };

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/users`).subscribe({
      next: (data) => (this.users = data),
      error: (e) => console.error('Error usuarios:', e),
    });
  }

  loadStats() {
    this.http.get<any>(`${this.apiUrl}/dashboard/statistics`).subscribe({
      next: (data) => {
        console.log('🔥 DATOS RECIBIDOS DEL BACKEND:', data);

        // 1. Gráfico de Barras
        this.barChartData = {
          labels: data.postsByUser.map((u: any) => u.username),
          datasets: [
            {
              data: data.postsByUser.map((u: any) => u.count),
              label: 'Cantidad de Posts',
              backgroundColor: '#42A5F5',
              barPercentage: 0.5,
              categoryPercentage: 0.8,
            },
          ],
        };

        // 2. Total simple
        this.totalComments = data.totalComments;

        // 3. Gráfico de Torta
        // Validamos si hay datos para evitar errores
        const comments = data.commentsByPost || [];

        this.pieChartData = {
          // 3. CORRECCIÓN IMPORTANTE: Usar 'postTitle' en lugar de 'postMessage'
          labels: comments.map((p: any) => p.postTitle || 'Sin Título'),
          datasets: [
            {
              data: comments.length ? comments.map((p: any) => p.count) : [0],
              backgroundColor: comments.length ? undefined : ['#e0e0e0'],
            },
          ],
        };

        // 4. CORRECCIÓN CRÍTICA: Forzar a los gráficos a actualizarse
        // Esto le dice a Angular: "¡Oye, los datos cambiaron, repinta el canvas!"
        this.charts?.forEach((child) => {
          child.update();
        });
      },
      error: (e) => console.error('Error stats:', e),
    });
  }

  toggleUserStatus(user: any) {
    const endpoint = user.isActive
      ? `${this.apiUrl}/users/${user._id}`
      : `${this.apiUrl}/users/${user._id}/restore`;

    const action = user.isActive ? this.http.delete(endpoint) : this.http.post(endpoint, {});

    action.subscribe({
      next: () => (user.isActive = !user.isActive),
      error: () => alert('No tenés permisos para hacer esto.'),
    });
  }
}
