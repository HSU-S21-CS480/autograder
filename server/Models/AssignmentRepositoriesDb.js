const sqlite3 = require('sqlite3').verbose();
let fs = require('fs');
let path = require('path');

class AssignmentRepositoriesDb {

   /**
    * AssignmentRepositoriesDb constructor.
    * @param {*} db_connection The database connection. 
    */
   constructor(db_connection) {
      this.db = db_connection;

      this.add = this.add.bind(this);
      this.all = this.all.bind(this);
      this.get = this.get.bind(this);
   }



   /**
    * Adds the URL link of the desired git repository to the database.
    * @param {Number} user_id The ID of the user submitting repository.
    * @param {String} assignment_id The ID of the assignment the repository is meant for. 
    * @param {String} url The URL of the repository.
    * @returns {Promise} Returns promise that resolves with the id of the new entry
    */
    add(user_id, assignment_id, url) {
      const sql = "INSERT INTO assignment_repositories(user_id, assignment_id, url) VALUES($user_id, $assignment_id, $url)";
      const params = { $user_id: user_id, $assignment_id: assignment_id, $url: url }

      return new Promise((resolve, reject) => {

         //AC: placing db callback function into its own variable changes 
         //*this* from local object to result of sqlite3 db call.
         var local_callback = function (err) {
            if (err === null) {
               resolve(this.lastID);
            }
            else {
               console.log(err)
               reject(err);
            }
         };
         this.db.run(sql, params, local_callback);
      });
   }



   /**
    * Returns all repositories for the specified assignment.
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @returns {Promise} Resolves with all assignments for the user if successful; 
    *    rejects if there is an error or user has no assignments. 
    */
   all(assignment_id){
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM assignment_repositories WHERE assignment_id = $assignment_id";
         this.db.all(sql, {$assignment_id: assignment_id}, (err, rows) => {
            if (err === null && rows !== undefined) {
               resolve(rows);
            }
            else if (err !== null) {
               console.log(err);
               reject(err); 
            }
            else {
               reject(); 
            }
         });
      });
   }


   /**
    * Returns a single file based on its user and assignment id's.
    * @param {Number} user_id The user's's ID number (integer).
    * @param {Number} assignment_id The assignment's ID number (integer).
    *    error if the file does not exist or other error occurs. 
    */
   get(user_id, assignment_id){
      const sql = "SELECT * FROM assignment_repositories WHERE user_id = $user_id AND assignment_id = $assignment_id";
      const params = { $user_id: user_id, $assignment_id: assignment_id };
      return new Promise((resolve, reject) => {
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               resolve(row);
            }
            else {
               reject(err);
            }
         });
     });
   }



   isUnique(user_id, assignment_id) {
      const sql = "SELECT * FROM assignment_repositories WHERE user_id = $user_id AND assignment_id = $assignment_id";
      const params = {$user_id: user_id, $assignment_id: assignment_id};
      return new Promise((resolve, reject) => {
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               reject("Repository is already linked!");
            }
            else if (err !== null) {
               console.log(err);
            }
            resolve(true);
         });
     });
   }
}










/**
 * Contains methods to alter records of files belonging to assignments
 * in the database. 
 * @typedef {Object} AssignmentRepositoriesDb
 */

/**
 * Creates a new AssignmentRepositoriesDb.
 * @param {Object} db_connection Database connection.
 * @returns {AssignmentRepositoriesDb} Instance of AssignmentRepositoriesDb.
 */
exports.createAssignmentRepositoriesDb = function (db_connection) {
   return new AssignmentRepositoriesDb(db_connection);
}