import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  inject,
  OnInit,
  ViewChildren,
  QueryList,
  ChangeDetectorRef,
} from '@angular/core';
import { environment } from '../../../enviroments/enviroment.prod';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ModalService } from '../../services/modal.service';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/nav/nav';
import { UsersService } from '../../services/users.service';
import  { FilterPipe } from '../../pipes/filter.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule, NavbarComponent, FilterPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private modalService = inject(ModalService);
  private cdr = inject(ChangeDetectorRef);
  private userService = inject(UsersService);

  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;

  users: any[] = [];
  totalComments: number = 0;

  // --- COLORES AESTHETIC (Dark Mode) ---
  private chartTextColor = '#e0e0e0';
  private chartGridColor = 'rgba(255, 255, 255, 0.1)';

  filters = {
    from: '',
    to: '',
  };
  searchTerm = '';

  showCreateForm = false; // Para mostrar/ocultar el formulario
  newUser: any = {
    name: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthdate: '',
    profile: 'user',
  };

  // 1. Configuración BARRAS
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Posts Publicados',
        backgroundColor: '#7c4dff', // Violeta vibrante
        hoverBackgroundColor: '#651fff',
        barPercentage: 0.6,
        categoryPercentage: 0.8,
        borderRadius: 6, // Bordes redondeados
      },
    ],
  };

  public barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 200,
    plugins: {
      legend: { labels: { color: this.chartTextColor, font: { family: 'Roboto' } } },
    },
    scales: {
      x: {
        ticks: { color: this.chartTextColor },
        grid: { color: 'transparent' },
      },
      y: {
        beginAtZero: true,
        ticks: { color: this.chartTextColor, stepSize: 1 },
        grid: { color: this.chartGridColor },
      },
    },
  };

  // 2. Configuración TORTA
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          '#6200ea', // Violeta oscuro
          '#03dac6', // Teal (Aesthetic cyan)
          '#ff4081', // Rosa neón
          '#7c4dff', // Violeta medio
          '#cf6679', // Rojo desaturado
        ],
        borderColor: '#1e1e1e', // Borde oscuro para separar porciones
        borderWidth: 2,
      },
    ],
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
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          // Personalizamos el tooltip para que diga "5 Comentarios"
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            return ` ${label}: ${value} Comentarios`;
          },
        },
      },
    },
  };

  ngOnInit() {
    this.loadUsers();
    this.loadStats();
  }

  loadUsers() {
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (e) => console.error('Error cargando usuarios:', e),
    });
  }

  loadStats() {
    this.userService.getDashboardStats(this.filters.from, this.filters.to).subscribe({
      next: (data) => {
        // --- ACTUALIZAR BARRAS ---
        this.barChartData = {
          labels: data.postsByUser.map((u: any) => u.username),
          datasets: [
            {
              data: data.postsByUser.map((u: any) => u.count),
              label: 'Cantidad de Posts',
              backgroundColor: '#7c4dff',
              barPercentage: 0.5,
              categoryPercentage: 0.8,
              borderRadius: 5,
            },
          ],
        };

        this.totalComments = data.totalComments;

        // --- ACTUALIZAR TORTA ---
        const comments = data.commentsByPost || [];
        this.pieChartData = {
          labels: comments.length
            ? comments.map((p: any) => `Post: "${p.postTitle}"`)
            : ['Sin Datos'],
          datasets: [
            {
              data: comments.length ? comments.map((p: any) => p.count) : [1],
              backgroundColor: comments.length
                ? ['#6200ea', '#03dac6', '#ff4081', '#7c4dff', '#cf6679']
                : ['#424242'],
              borderColor: '#1e1e1e',
              borderWidth: 2,
            },
          ],
        };

        this.cdr.detectChanges();
        setTimeout(() => {
          this.charts?.forEach((child) => child.update());
        }, 200);
      },
      error: (e) => console.error('Error stats:', e),
    });
  }

  applyFilters() {
    this.loadStats();
  }

  clearFilters() {
    this.filters = { from: '', to: '' };
    this.loadStats();
  }

  createUser() {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password) {
      return this.modalService.showConfirm('Error', 'Todos los campos son obligatorios');
    }
    this.newUser.confirmPassword = this.newUser.password;

    // Usamos el servicio
    this.userService.createUser(this.newUser).subscribe({
      next: (res) => {
        this.modalService.show('Usuario creado', 'El usuario fue creado con éxito.');
        this.showCreateForm = false;
        this.resetForm();
        this.loadUsers();
        this.loadStats();
      },
      error: (err) => {
        console.log(err);
        // Aquí podrías mostrar el error específico que te manda el back (ej: "Forbidden")
        this.modalService.show('Error', err.error?.message || 'Error al crear el usuario');
      },
    });
  }

  resetForm() {
    this.newUser = {
      name: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthdate: '',
      profile: 'user',
    };
  }

  toggleUserStatus(user: any) {
    const action = user.isActive
      ? this.userService.disableUser(user._id)
      : this.userService.restoreUser(user._id);

    action.subscribe({
      next: () => {
        user.isActive = !user.isActive;
        this.cdr.detectChanges();
      },
      error: (err) => this.modalService.show('Error', err.message),
    });
  }
}
