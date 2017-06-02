'use strict';

let firebase = require('firebase');
let Promise = require('promise');
let path = require('path');
let fs = require('fs');

let { config } = require('./config.js');
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
  return Promise.all(updates.reduce((p, update) =>
    [...p, ...Object.keys(update.data).map((key) =>
    firebase.database().ref(`${update.ref}/${key}`).transaction(() =>
      update.data[key], error => { if (error) { console.log(error)}}))], []));
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