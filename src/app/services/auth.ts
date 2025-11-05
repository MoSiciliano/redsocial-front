import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Credentials } from '../models/credentials';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  httpClient = inject(HttpClient);

  //apiUrl = 'https://morena-siciliano-redsocial-back.vercel.app';
   apiUrl = 'http://localhost:3000';
  async login(credentials: Credentials) {
    const req = this.httpClient.post(this.apiUrl + '/auth/login', credentials, {
      headers: { 'Content-Type': 'application/json' },
    });
    req.subscribe((res: any) => {
      console.log(res);
      localStorage.setItem('token', res.token);
    });
  }

  async loginCookie(credentials: Credentials) {
    const req = this.httpClient.post(this.apiUrl + '/auth/login/cookie', credentials, {
      withCredentials: true,
    });
    req.subscribe((res) => {
      console.log(res);
    });
  }
  getData() {
    const req = this.httpClient.get(this.apiUrl + '/auth/data/jwt', {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    });
    req.subscribe((res) => {
      console.log(res);
    });
  }
  getDataCookie() {
    const req = this.httpClient.get(this.apiUrl + '/auth/data/jwt/cookie', {
      withCredentials: true,
    });
    req.subscribe((res) => {
      console.log(res);
    });
  }
}
