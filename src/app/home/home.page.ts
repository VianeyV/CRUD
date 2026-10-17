import { Component, ChangeDetectorRef } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Database, ref, onValue, remove } from '@angular/fire/database';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  infos: any = [];
  userRole: string = 'user'; // Variable para almacenar el rol actual

  constructor(
    private router: Router,
    private alertController: AlertController,
    private database: Database,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ionViewWillEnter() {
    // Obtenemos el rol del usuario al entrar a la vista
    this.userRole = await this.authService.getUserRole();
    this.loadData();
  }

  loadData() {
    const dbRef = ref(this.database, 'infos/');

    onValue(dbRef, (snapshot) => {
      const tempArray: any = [];
      snapshot.forEach((childSnapshot) => {
        tempArray.push({
          id: childSnapshot.key,
          info_title: childSnapshot.val().info_title,
          info_description: childSnapshot.val().info_description
        });
      });
      
      this.infos = tempArray;
      this.cdr.detectChanges();
    });
  }

  edit(id: string) {
    this.router.navigate(['/edit', { id: id }]);
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  async delete(id: string) {
    // Restricción adicional por seguridad frontend: solo administradores pueden borrar
    if (this.userRole !== 'admin') {
      const alert = await this.alertController.create({
        header: 'Acceso Denegado',
        message: 'No tienes permisos de administrador para borrar registros.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: '¿Confirmar eliminación?',
      message: '¿Estás seguro de que deseas borrar este registro?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, Borrar',
          handler: () => {
            remove(ref(this.database, 'infos/' + id)).catch((error) => {
              console.error(error);
            });
          }
        }
      ]
    });

    await alert.present();
  }
}