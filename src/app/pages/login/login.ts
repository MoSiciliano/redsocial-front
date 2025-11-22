import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Credentials } from '../../models/credentials';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: 'login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login{
  authService = inject(AuthService);
  router = inject(Router);
  modalService = inject(ModalService);

  loginForm = new FormGroup({
    identifier: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService
      .login(this.loginForm.value as Credentials)
      .subscribe({
        next: (res: any) => {
          const rol = res.user.profile;
          if (rol === 'admin') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/posts']);
          }
        },
        error: (err) => {
          this.modalService.showConfirm('Error', 'Usuario o contraseña incorrectos.');
        }
      });
  }
}