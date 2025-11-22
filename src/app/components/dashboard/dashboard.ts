import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, ViewChildren, QueryList, ChangeDetectorRef } from '@angular/core'; 
import { environment } from '../../../enviroments/enviroment.prod';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-dashboard',
  standalone: true, 
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  apiUrl = environment.apiUrl;
  users: any[] = [];
  totalComments: number = 0;

  // --- COLORES AESTHETIC (Dark Mode) ---
  private chartTextColor = '#e0e0e0'; 
  private chartGridColor = 'rgba(255, 255, 255, 0.1)';

  // 1. Configuración BARRAS
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [{ 
      data: [], 
      label: 'Posts Publicados', 
      backgroundColor: '#7c4dff', // Violeta vibrante
      hoverBackgroundColor: '#651fff',
      barPercentage: 0.6,
      categoryPercentage: 0.8,
      borderRadius: 6 // Bordes redondeados
    }]
  };
  
  public barChartOptions: ChartOptions<'bar'> = { 
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 200,
    plugins: {
      legend: { labels: { color: this.chartTextColor, font: { family: 'Roboto' } } }
    },
    scales: {
      x: {
        ticks: { color: this.chartTextColor },
        grid: { color: 'transparent' }
      },
      y: { 
        beginAtZero: true, 
        ticks: { color: this.chartTextColor, stepSize: 1 },
        grid: { color: this.chartGridColor } 
      }
    }
  };

  // 2. Configuración TORTA
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ 
      data: [],
      backgroundColor: [
        '#6200ea', // Violeta oscuro
        '#03dac6', // Teal (Aesthetic cyan)
        '#ff4081', // Rosa neón
        '#7c4dff', // Violeta medio
        '#cf6679'  // Rojo desaturado
      ],
      borderColor: '#1e1e1e', // Borde oscuro para separar porciones
      borderWidth: 2
    }]
  };
  
  public pieChartOptions: ChartOptions<'pie'> = { 
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { 
          color: this.chartTextColor,
          padding: 20,
          font: { size: 12 }
        } 
      },
      tooltip: {
        callbacks: {
          // Personalizamos el tooltip para que diga "5 Comentarios"
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return ` ${label}: ${value} Comentarios`;
          }
        }
      }
    }
  };

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers() {
    this.http.get<any[]>(`${this.apiUrl}/users`).subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('❌ Error cargando usuarios:', e)
    });
  }

  loadStats() {
    this.http.get<any>(`${this.apiUrl}/dashboard/statistics`).subscribe({
      next: (data) => {
        console.log('🔥 Stats recibidas:', data);
        
        // --- ACTUALIZAR BARRAS ---
        this.barChartData = {
          labels: data.postsByUser.map((u: any) => u.username),
          datasets: [{ 
            data: data.postsByUser.map((u: any) => u.count), 
            label: 'Cantidad de Posts',
            backgroundColor: '#7c4dff',
            barPercentage: 0.5,
            categoryPercentage: 0.8,
            borderRadius: 5
          }]
        };

        this.totalComments = data.totalComments;

        // --- ACTUALIZAR TORTA (Aquí está el cambio de etiqueta) ---
        const comments = data.commentsByPost || [];
        this.pieChartData = {
          // AQUI: Agregamos 'Post: ' para que se entienda que es el título del post
          labels: comments.length 
            ? comments.map((p: any) => `Post: "${p.postTitle}"`) 
            : ['Sin Datos'], 
          datasets: [{ 
            data: comments.length ? comments.map((p: any) => p.count) : [1],
            backgroundColor: comments.length ? [
              '#6200ea', '#03dac6', '#ff4081', '#7c4dff', '#cf6679'
            ] : ['#424242'], // Gris si está vacío
            borderColor: '#1e1e1e',
            borderWidth: 2
          }]
        };

        this.cdr.detectChanges(); 
        
        // Pequeño delay para asegurar que el CSS de Tailwind cargó
        setTimeout(() => {
          this.charts?.forEach((child) => {
            child.update();
          });
        }, 200);
      },
      error: (e) => console.error('❌ Error stats:', e)
    });
  }

  toggleUserStatus(user: any) {
    const endpoint = user.isActive 
      ? `${this.apiUrl}/users/${user._id}` 
      : `${this.apiUrl}/users/${user._id}/restore`;

    const action = user.isActive ? this.http.delete(endpoint) : this.http.post(endpoint, {});

    action.subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.cdr.detectChanges(); 
      },
      error: () => alert('No tenés permisos para hacer esto.')
    });
  }
}