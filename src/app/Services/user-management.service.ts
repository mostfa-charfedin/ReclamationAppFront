import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { UserManagement, UpdateUserRequest, CreateUserRequest } from '../Models/user-management';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = 'http://localhost:8083/api/users';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<UserManagement[]> {
    return this.http.get<UserManagement[]>(this.apiUrl);
  }

  getUserById(id: string): Observable<UserManagement> {
    return this.http.get<UserManagement>(`${this.apiUrl}/${id}`);
  }

  createUser(userData: CreateUserRequest): Observable<UserManagement> {
    return this.http.post<UserManagement>(this.apiUrl, userData);
  }

  updateUser(id: string, userData: UpdateUserRequest): Observable<UserManagement> {
    return this.http.put<UserManagement>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activateUser(id: string): Observable<UserManagement> {
    return this.http.patch<UserManagement>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateUser(id: string): Observable<UserManagement> {
    return this.http.patch<UserManagement>(`${this.apiUrl}/${id}/deactivate`, {});
  }
}
