const sqlite3 = require('sqlite3').verbose();
const UsersDb = require('./UsersDb.js');
const CoursesDb = require('./CourseDb.js');
const AssignmentsDb = require('./AssignmentsDb.js');
const AssignmentFilesDb = require('./AssignmentFilesDb.js');
const TestCasesDb = require('./TestCasesDb.js');


class Database{

   constructor(connection_string, hash_salt = "change this", crypto_method = "sha512"){
      this.connection_string = connection_string;
      this.hash_salt = hash_salt;
      this.crypto_method = crypto_method;
      this.db = new sqlite3.Database(connection_string, sqlite3.OPEN_READWRITE, (err) => {
         if (err) {
            console.error(err.message);
         }
      });

      this.Users = UsersDb.createUsersDb(this.db, this.crypto_method);
      this.Courses = CoursesDb.createCoursesDb(this.db);
      this.Assignments = AssignmentsDb.createAssignmentsDb(this.db);
      this.Assignments.Files = AssignmentFilesDb.createAssignmentFilesDb(this.db);
      this.Assignments.TestCases = TestCasesDb.createTestCasesDb(this.db);

      //AC: I like the idea of doing this.Assignments.Files better than having something separate,
      //so I added AssignmentFiles as a prop.  Leaving this one here for now for compatibility.
      this.AssignmentFiles = this.Assignments.Files;

      
   }

   
}

exports.createDatabase = function(connection_string, hash_salt = "change this", crypto_method = "sha512"){
   return new Database(connection_string, hash_salt, crypto_method);
}