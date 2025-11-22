import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { environment } from '../../../enviroments/enviroment.prod';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private http = inject(HttpClient);
  private modalService = inject(ModalService);  

  apiUrl = environment.apiUrl;
  users: any[] = [];
  totalComments: number = 0;
public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ data: [], label: 'Posts Publicados', backgroundColor: '#42A5F5' }]
  };
  public barChartOptions: ChartOptions<'bar'> = { 
    responsive: true,
    maintainAspectRatio: false // Para que se adapte mejor al div
  };

  // --- Configuración Torta ---
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ data: [] }]
  };
  public pieChartOptions: ChartOptions<'pie'> = { 
    responsive: true,
    maintainAspectRatio: false 
  };

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/users`).subscribe({
      next: (data) => this.users = data,
      error: (e) => console.error('Error usuarios:', e)
    });
  }

  loadStats() {
    this.http.get<any>(`${this.apiUrl}/dashboard/statistics`).subscribe({
      next: (data) => {
        console.log('🔥 DATOS RECIBIDOS DEL BACKEND:', data);
        // 1. Gráfico de Barras
        this.barChartData = {
          labels: data.postsByUser.map((u: any) => u.username),
          datasets: [{ 
            data: data.postsByUser.map((u: any) => u.count), 
            label: 'Cantidad de Posts',
            backgroundColor: '#42A5F5'
          }]
        };

        // 2. Total simple
        this.totalComments = data.totalComments;

        // 3. Gráfico de Torta
        if(data.commentsByPost) {
           this.pieChartData = {
            labels: data.commentsByPost.map((p: any) => p.postMessage ),
            datasets: [{ data: data.commentsByPost.map((p: any) => p.count) }]
          };
        }
      },
      error: (e) => console.error('Error stats:', e)
    });
  }

  toggleUserStatus(user: any) {
    const endpoint = user.isActive 
      ? `${this.apiUrl}/users/${user._id}` 
      : `${this.apiUrl}/users/${user._id}/restore`;

    const action = user.isActive ? this.http.delete(endpoint) : this.http.post(endpoint, {});

    action.subscribe({
      next: () => user.isActive = !user.isActive,
      error: () => alert('No tenés permisos para hacer esto.')
    });
  }
}
