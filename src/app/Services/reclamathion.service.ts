import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {

 private apiUrl = 'https://sicam-app.onrender.com/api/reclamations';

  constructor(private http: HttpClient) {}

  getAllReclamations(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getReclamationById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createReclamation(reclamationData: any): Observable<any> {
    return this.http.post(this.apiUrl, reclamationData);
  }

  getReclamationsByUser(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`);
  }

  getReclamationsByTechnicien(technicienId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/technicien/${technicienId}`);
  }

  assignTechniciens(reclamationId: string, technicienIds: string[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reclamationId}/assign`, technicienIds);
  }

  updateReclamationStatus(id: string, statut: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { statut });
  }

  addComment(reclamationId: string, commentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${reclamationId}/comments`, commentData);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  deleteReclamation(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
