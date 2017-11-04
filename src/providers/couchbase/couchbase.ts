import { Injectable, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Platform } from 'ionic-angular';
import { Couchbase, Database } from "cordova-couchbase/core";

declare var emit: any;

@Injectable()
export class CouchbaseProvider {

  private isInstantiated: boolean;
  private database: Database;
  private listener: EventEmitter<any> = new EventEmitter();

  constructor(public http: Http, platform: Platform) {
    console.log('Hello CouchbaseProvider Provider');
    if (!this.isInstantiated) {
      console.log('1');
      platform.ready().then(() => {
        console.log('2');
        (new Couchbase()).openDatabase("nraboy").then(database => {
          console.log('3');
          this.database = database;
          let views = {
            items: {
              map: function (doc) {
                if (doc.type == "list" && doc.title) {
                  emit(doc._id, { title: doc.title, rev: doc._rev })
                }
              }.toString()
            }
          };
          this.database.createDesignDocument("_design/todo", views);
          this.database.listen(change => {
            this.listener.emit(change.detail);
          });
          this.database.sync("http://192.168.0.10:4984/example", true);
          this.isInstantiated = true;
        }, error => {
          console.error(error);
        });
      });
    }
  }

  public getDatabase() {
    return this.database;
  }

  public getChangeListener(): EventEmitter<any> {
    return this.listener;
  }

}
