import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  API_URL = "http://localhost:5000/api/auth";

  constructor(private http: HttpClient) {}

  login(data: any) {
    console.log('Sending login request to:', `${this.API_URL}/login`);
    return this.http.post(`${this.API_URL}/login`, data);
  }

  register(data: any) {
    console.log('Sending register request to:', `${this.API_URL}/register`);
    return this.http.post(`${this.API_URL}/register`, data);
  }
}