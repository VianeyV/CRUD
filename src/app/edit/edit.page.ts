import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { DataSnapshot, Database, ref, onValue, set } from "@angular/fire/database";

@Component({
  selector: 'app-edit',
  templateUrl: './edit.page.html',
  styleUrls: ['./edit.page.scss'],
  standalone: false,
})
export class EditPage implements OnInit {
  info: any;
  
  infoForm = this.formBuilder.group({
    info_title: [null, Validators.required],
    info_description: [null, Validators.required]
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private database: Database // <--- Inyección segura de Firebase Database
  ) {}

  ngOnInit() {
    this.getInfo();
  }

  getInfo() {
    const id = this.route.snapshot.paramMap.get('id');
    const infoRef = ref(this.database, 'infos/' + id);

    onValue(infoRef, (snapshot) => {
      if (snapshot.exists()) {
        this.info = snapshotToObject(snapshot);
        this.infoForm.controls['info_title'].setValue(this.info.info_title);
        this.infoForm.controls['info_description'].setValue(this.info.info_description);
      }
    }, { onlyOnce: true }); // Usamos onlyOnce para evitar bucles de lectura innecesarios
  }

  updateInfo() {
    const id = this.route.snapshot.paramMap.get('id');
    set(ref(this.database, 'infos/' + id), this.infoForm.value)
      .then(() => {
        // Redirigimos directamente a /home para que la lista se refleje al instante
        this.router.navigate(['/home']);
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

// clase para convertir la respuesta de la base de datos en tiempo real de Firebase en un objeto Angular.
export const snapshotToObject = (snapshot: DataSnapshot) => {
  let item = snapshot.val() as any;
  item.key = snapshot.key;
  return item;
}