import { Component, OnInit } from '@angular/core';
import { Database, ref, set } from "@angular/fire/database";
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-create',
  templateUrl: './create.page.html',
  styleUrls: ['./create.page.scss'],
  standalone: false,
})
export class CreatePage implements OnInit {
  infoForm = this.formBuilder.group({
    info_title: [null, Validators.required],
    info_description: [null, Validators.required]
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private database: Database
  ) { }

  ngOnInit() {}

  saveInfo() {
    if (this.infoForm.valid) {
      const id = uuidv4();
      set(ref(this.database, 'infos/' + id), this.infoForm?.value).then(() => {
        // Redirigimos directamente a home para actualizar la lista en tiempo real
        this.router.navigate(['/home']);
      }).catch((error) => {
        console.error("Error al guardar:", error);
      });
    }
  }
}