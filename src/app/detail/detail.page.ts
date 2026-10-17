import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSnapshot, getDatabase, onValue, ref } from "firebase/database";

const db = getDatabase();

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: false,
})
export class DetailPage implements OnInit {
  info: any = {};
    constructor(
    private route: ActivatedRoute,
    public router: Router
  ) {
    const infoRef = ref(db, 'infos/' + this.route.snapshot.paramMap.get('id'));
    onValue(infoRef, (snapshot) => {
      const data = snapshot.val();
      this.info = snapshotToObject(snapshot);
    });
  }

  ngOnInit() {
  }

}
export const snapshotToObject = (snapshot: DataSnapshot) => {
  let item = snapshot.val();
  item.key = snapshot.key;

  return item;
}
