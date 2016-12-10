'use strict';

let firebase = require('firebase');
let Promise = require('promise');
let path = require('path');
let fs = require('fs');

let config = require('./config.js').config;
let filePath = path.resolve(__dirname, '../inputs/input.json');
let json = JSON.parse(fs.readFileSync(filePath, 'utf8'));

init(false);

auth()
  .then(prepareUpdates)
  .then(updateData)
  .then(process.exit);

function init(logging) {
  // Initialize Firebase
  firebase.initializeApp(config.firebase.config);
  // Optional Firebase logging
  if (logging === true) {
    firebase.database.enableLogging(true);
  }
}

function auth() {
  return firebase.auth().signInWithEmailAndPassword(
    config.firebase.credentials.email,
    config.firebase.credentials.password);
}

function updateData(updates) {
  return new Promise( (resolve, reject) => {
    let completed = 0;
    for (let i = 0; i < updates.length; i++) {
      let ref = firebase.database().ref( updates[i].ref );
      ref.transaction( () => {
        return updates[i].data;
      }, () => {
        completed++;
        if (completed === updates.length) {
          resolve();
        }
      });
    }
  });
}

function prepareUpdates() {
  return new Promise( (resolve, reject) => {
    let updates = [];
    updates.push({
      ref: 'client',
      data: json.data
    });
    resolve(updates);
  });
}