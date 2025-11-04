import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

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




getStatsFromReclamations(): Observable<any> {
  return this.getAllReclamations().pipe(
    map(reclamations => {
      const maintenant = new Date();
      const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);

      const stats = {
        total: reclamations.length,
        nouvelles: reclamations.filter(r => r.statut === 'NOUVELLE').length,
        assignees: reclamations.filter(r => r.statut === 'ASSIGNEE').length,
        enCours: reclamations.filter(r => r.statut === 'EN_COURS').length,
        resolues: reclamations.filter(r => r.statut === 'RESOLUE').length,
        ceMois: reclamations.filter(r => new Date(r.dateCreation) >= debutMois).length,
        tempsMoyenTraitement: this.calculerTempsMoyenTraitement(reclamations)
      };

      return stats;
    })
  );
}

private calculerTempsMoyenTraitement(reclamations: any[]): number {
  const reclamationsResolues = reclamations.filter(r => r.statut === 'RESOLUE' && r.dateCreation && r.dateResolution);

  if (reclamationsResolues.length === 0) return 0;

  const totalJours = reclamationsResolues.reduce((acc, reclamation) => {
    const dateCreation = new Date(reclamation.dateCreation);
    const dateResolution = new Date(reclamation.dateResolution);
    const differenceTemps = dateResolution.getTime() - dateCreation.getTime();
    const differenceJours = differenceTemps / (1000 * 3600 * 24);
    return acc + differenceJours;
  }, 0);

  return Math.round((totalJours / reclamationsResolues.length) * 10) / 10; // Arrondi à 1 décimale
}

}
