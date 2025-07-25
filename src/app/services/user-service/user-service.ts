import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Utilisateur } from '../../models/utilisateur';
import { AuthService } from '../auth-service/auth-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient, private authService: AuthService) {}

  updateUser(
    id: number,
    userData: Partial<Utilisateur>
  ): Observable<Utilisateur> {
    // Récupérer le token via AuthService (plus propre)
    const token = this.authService.getToken();

    // Vérifier que le token existe
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    // Créer les en-têtes avec l'autorisation
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    // Faire la requête avec les en-têtes
    return this.http.put<Utilisateur>(
      `${this.apiUrl}/update/user/${id}`,
      userData,
      { headers }
    );
  }
  getUserProfile(): Observable<Utilisateur> {
    const token = this.authService.getToken();

    // Vérifier que le token existe
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const payload = JSON.parse(atob(token.split('.')[1]));

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<Utilisateur>(`${this.apiUrl}/get/user/${payload.id}`, {
      headers,
    });
  }

  getAllUsers(): Observable<Utilisateur[]> {
    const token = this.authService.getToken();

    // Vérifier que le token existe
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }


    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    

    // Essayer d'abord l'endpoint /get/users, sinon /get/user/All en fallback
    return this.http.get<Utilisateur[]>(`${this.apiUrl}/get/users`, {
      headers,
    });
  }

  changerRole(userId: number, newRole: string): Observable<any> {
    const token = this.authService.getToken();

    // Vérifier que le token existe
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    // Selon votre nouveau contrôleur: @PostMapping("change/role/{idUser}") avec @RequestBody Role
    return this.http.post(
      `${this.apiUrl}/change/role/${userId}`,
      { libelle: newRole },
      { 
        headers,
        responseType: 'json' // Maintenant on s'attend à du JSON
      }
    );
  }

  supprimerUser(userId: number): Observable<any> {
    const token = this.authService.getToken();

    // Vérifier que le token existe
    if (!token) {
      throw new Error("Token d'authentification manquant");
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.delete(`${this.apiUrl}/delete/user/${userId}`, {
      headers,
    });
  }
}
