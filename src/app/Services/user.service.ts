import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {

private apiUrl = 'https://sicam-app.onrender.com/api/users';

  constructor(private http: HttpClient) {}

  getTechniciens(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/techniciens`);
  }

  createTechnicien(technicien: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/techniciens`, technicien);
  }

  getTechnicienStats(technicienId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/techniciens/${technicienId}/stats`);
  }
}
