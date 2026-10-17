import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendPasswordResetEmail } from '@angular/fire/auth';
import { Database, ref, set, get, child } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private database = inject(Database);

  async login(email: string, pass: string): Promise<boolean> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, pass);
      const uid = userCredential.user.uid;

      // ⚠️ CAMBIA esto por tu correo real de administrador
      const adminEmail = 'estefanyrivera201595@gmail.com'; 
      const role = (email.toLowerCase() === adminEmail.toLowerCase()) ? 'admin' : 'user';

      // Guardar el rol en la base de datos ahora que las reglas están permitidas
      await set(ref(this.database, 'users/' + uid), {
        email: email,
        role: role
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async register(email: string, pass: string): Promise<boolean> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, pass);
      const uid = userCredential.user.uid;

      await set(ref(this.database, 'users/' + uid), {
        email: email,
        role: 'user'
      });

      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getUserRole(): Promise<string> {
    const user = this.auth.currentUser;
    if (!user) return 'user';

    try {
      const dbRef = ref(this.database);
      const snapshot = await get(child(dbRef, `users/${user.uid}/role`));
      if (snapshot.exists()) {
        return snapshot.val();
      }
      return 'user';
    } catch (error) {
      console.error('Error al obtener el rol:', error);
      return 'user';
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}