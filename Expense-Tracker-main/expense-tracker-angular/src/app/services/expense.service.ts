import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {

  api = "http://localhost:5000/api/expenses";

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getExpenses(){
    return this.http.get(this.api, { headers: this.getHeaders() });
  }

  addExpense(data:any){
    return this.http.post(this.api, data, { headers: this.getHeaders() });
  }

  deleteExpense(id:any){
    return this.http.delete(this.api + "/" + id, { headers: this.getHeaders() });
  }

  updateExpense(id: any, data: any){
    return this.http.put(this.api + "/" + id, data, { headers: this.getHeaders() });
  }

}