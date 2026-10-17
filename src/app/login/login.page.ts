import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonItem, IonInput, IonButton, IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon, IonCheckbox } from '@ionic/angular';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,
    IonCheckbox
  ]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  registerForm: FormGroup;
  forgotForm: FormGroup;
  
  errorMessage: string = '';
  registerErrorMessage: string = '';
  forgotErrorMessage: string = '';
  forgotSuccessMessage: string = '';
  
  isRegisterModalOpen: boolean = false;
  isForgotModalOpen: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Recuperar usuario guardado previamente si existe
    const savedUser = localStorage.getItem('saved_username') || '';
    const rememberStatus = savedUser !== '';

    this.loginForm = this.fb.group({
      username: [savedUser, [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [rememberStatus]
    });

    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {}

  async onLogin() {
    if (this.loginForm.valid) {
      const { username, password, rememberMe } = this.loginForm.value;

      // Guardar o limpiar el correo según el checkbox
      if (rememberMe) {
        localStorage.setItem('saved_username', username);
      } else {
        localStorage.removeItem('saved_username');
      }

      const success = await this.authService.login(username, password);

      if (success) {
        this.errorMessage = '';
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = 'Correo o contraseña incorrectos en Firebase.';
      }
    }
  }

  openRegisterModal() {
    this.registerErrorMessage = '';
    this.registerForm.reset();
    this.isRegisterModalOpen = true;
  }

  closeRegisterModal() {
    this.isRegisterModalOpen = false;
  }

  openForgotPasswordModal() {
    this.forgotErrorMessage = '';
    this.forgotSuccessMessage = '';
    this.forgotForm.reset();
    this.isForgotModalOpen = true;
  }

  closeForgotModal() {
    this.isForgotModalOpen = false;
  }

  async onResetPassword() {
    if (this.forgotForm.valid) {
      const email = this.forgotForm.value.email;
      const success = await this.authService.resetPassword(email);

      if (success) {
        this.forgotSuccessMessage = '¡Correo enviado! Revisa tu bandeja para cambiar la contraseña.';
        this.forgotErrorMessage = '';
      } else {
        this.forgotErrorMessage = 'No se pudo enviar el correo. Verifica que esté registrado.';
        this.forgotSuccessMessage = '';
      }
    }
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const { username, password } = this.registerForm.value;
      const success = await this.authService.register(username, password);

      if (success) {
        this.isRegisterModalOpen = false;
        alert('¡Usuario creado e iniciado con éxito!');
        this.router.navigate(['/home']);
      } else {
        this.registerErrorMessage = 'No se pudo crear el usuario (verifica si el correo ya está registrado).';
      }
    } else {
      this.registerErrorMessage = 'Por favor ingresa un correo válido y una contraseña de al menos 6 caracteres.';
    }
  }
}