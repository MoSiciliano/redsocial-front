import { Component, inject } from '@angular/core';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  auth = inject(Auth);

  login() {
    this.auth.login({ identifier: 'morenadmina', password: 'Password01' });
  }
  loginCookie() {
    this.auth.loginCookie({ identifier: 'morena123', password: 'Password1' });
  }
  getData() {
    this.auth.getData();
  }
   getDataCookie() {
    this.auth.getDataCookie();
  }
}
