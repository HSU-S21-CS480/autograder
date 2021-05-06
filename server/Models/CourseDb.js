const sqlite3 = require('sqlite3').verbose();

class CoursesDb {
   /**
    * CoursesDb constructor.
    * @param {*} db_connection The database connection. 
    */
   constructor(db_connection) {
      this.db = db_connection;

      this.addCourse = this.addCourse.bind(this);
      this.addUser = this.addUser.bind(this);
      this.all = this.all.bind(this);
      this.assignments = this.assignments.bind(this);
      this.canGrade = this.canGrade.bind(this);
      this.canModify = this.canModify.bind(this);
      this.courseUsers = this.courseUsers.bind(this);
      this.forUser = this.forUser.bind(this);
      this.isUnique = this.isUnique.bind(this);
      this.removeUser = this.removeUser.bind(this);
      this.setCourseRole = this.setCourseRole.bind(this);
   }

   /**
    * Adds a new course with the given information to the database.
    * @param {Number} school_id The ID of the school to which the course will be added (integer).
    * @param {String} name The course's name.
    * @param {String} term Which term this course is being taught.
    * @param {Number} year What year this course is being taught (integer).
    * @returns {Promise} Resolves with the new course's ID if successful; rejects with error otherwise.
    */
   addCourse(school_id, name, term, year) {
      const sql = "INSERT INTO courses(school_id, name, term, year) VALUES($school_id, $name, $term, $year)";
      const params = { $school_id: school_id, $name: name, $term: term, $year: year }

      return new Promise((resolve, reject) => {

         //AC: placing db callback function into its own variable changes 
         //*this* from local object to result of sqlite3 db call.
         var local_callback = function (err) {
            if (err === null) {
               resolve(this.lastID);
            }
            else {
               console.log(err);
               reject(err);
            }
         };
         this.db.run(sql, params, local_callback);
      });
   }








   /**
    * Adds an existing user to a course. 
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The user's ID number (integer). 
    * @returns {Promise} Resolves with the database's new row ID if successful; rejects with error otherwise. 
    */
   addUser(course_id, user_id) {
      const sql = "INSERT INTO course_users (course_id, user_id) VALUES($course_id, $user_id)";
      const params = { $course_id: course_id, $user_id: user_id }

      return new Promise((resolve, reject) => {

         //AC: placing db callback function into its own variable changes 
         //*this* from local object to result of sqlite3 db call.
         var local_callback = function (err) {
            if (err === null) {
               resolve(this.lastID);
            }
            else {
               console.log(err);
               reject(err);
            }
         };
         this.db.run(sql, params, local_callback);
      });
   }

   /**
    * Returns all courses.
    * @param {Boolean} [include_deleted=false] To include deleted courses, set this to true.
    * @returns {Promise} Resolves with all courses if successful; rejects with error otherwise. 
    */
   all(include_deleted = false) {
      return new Promise((resolve, reject) => {
         let sql = "SELECT c.*, s.name AS school_name, s.acronym  FROM courses c INNER JOIN schools s ON c.school_id = s.id";
         if (include_deleted === false) {
            sql += " WHERE is_deleted = 0";
         }
         sql += " ORDER BY c.year, c.term DESC";
         this.db.all(sql, {}, (err, rows) => {
            if (err === null && rows !== undefined) {
               resolve(rows);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else {
               reject(false);
            }
         });
      });
   }

   /**
    * Returns assignments for a given course.
    * @param {Number} course_id The course's ID number (integer).
    * @param {Boolean} [include_active=true] Set this to false to exclude active assignments.
    * @param {Boolean} [include_deleted=true] Set this to false to exclude deleted assignments.
    * @returns {Promise} Resolves with all selected assignments if successful; rejects otherwise.
    */
   assignments(course_id, include_active = true, include_deleted = true) {
      return new Promise((resolve, reject) => {
         let sql = "SELECT * FROM assignments WHERE course_id = $course_id";
         if (include_active === true && include_deleted === false) {
            sql += " AND is_deleted = 0";
         }
         else if (include_active === false && include_deleted === true) {
            sql += " AND is_deleted = 1";
         }
         this.db.all(sql, { $course_id: course_id }, (err, rows) => {
            if (err === null && rows !== undefined) {
               resolve(rows);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else {
               reject(false);
            }
         });
      });
   }

   /**
    * Returns true if the given user is permitted to grade assignments for this course.
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The given user's ID number (integer).
    * @returns {Promise} Resolves with true if the user may grade assignments for this course;
    *    rejects otherwise. 
    */
   canGrade(course_id, user_id) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM course_users "
            + "WHERE course_id = $course_id AND user_id = $user_id AND course_role & 8 > 0";
         const params = { $course_id: course_id, $user_id: user_id }
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               resolve(true);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else {
               reject(false);
            }
         });
      });
   }

   /**
    * Returns true if the given user is permitted to modify this course.
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The given user's ID number (integer).
    * @returns {Promise} Resolves with true if the user may modify this course;
    *    rejects otherwise.
    */
   canModify(course_id, user_id) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM course_users "
            + "WHERE course_id = $course_id AND user_id = $user_id AND course_role & 4 > 0";
         const params = { $course_id: course_id, $user_id: user_id }
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               resolve(true);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else {
               reject(false);
            }
         });
      });
   }


   /**
    * Returns true if the given user is permitted to modify this course.
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The given user's ID number (integer).
    * @returns {Promise} Resolves with true if the user can upload assignments to this course;
    *    rejects otherwise.
    */
    canSubmitAssignment(course_id, user_id) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM course_users "
            + "WHERE course_id = $course_id AND user_id = $user_id AND course_role & 2 > 0";
         const params = { $course_id: course_id, $user_id: user_id }
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               resolve(true);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else {
               reject(false);
            }
         });
      });
   }

   /**
    * Returns true if the given user is the creator of this course.
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The given user's ID number (integer).
    * @returns {Promise} Resolves with true if the user is the creator of this course;
    *    rejects otherwise.
    */
   isCreator(course_id, user_id) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM course_users "
            + "WHERE course_id = $course_id AND user_id = $user_id AND course_role & 16 > 0";
         const params = { $course_id: course_id, $user_id: user_id };
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               resolve(true);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else {
               reject(false);
            }
         });
      });
   }




   /**
    * Returns true if the course was successfully archived.
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The given user's ID number (integer).
    * @returns {Promise} Resolves with true if the course was successfully archived.
    *    rejects otherwise.
    */
   async archive(course_id, user_id) {
      const sql = "UPDATE courses " + "SET is_active = 0 " + "WHERE id = $course_id;";
      const params = { $course_id: course_id };

      try {
         this.db.run(sql, params);
         return true;
      } catch (e) {
         return e;
      }

   }




   /**
    * Returns true if the course was successfully reinstated.
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The given user's ID number (integer).
    * @returns {Promise} Resolves with true if the course was successfully reinstated.
    *    rejects otherwise.
    */
   async reinstate(course_id, user_id) {
      const sql = "UPDATE courses " + "SET is_active = 1 " + "WHERE id = $course_id;";
      const params = { $course_id: course_id };

      try {
         this.db.run(sql, params);

         return true;
      } catch (e) {
         return e;
      }

   }



   /**
    * Returns true if the course was successfully deleted.
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The given user's ID number (integer).
    * @returns {Promise} Resolves with true if the course was successfully deleted.
    *    rejects otherwise.
    */
   async delete(course_id, user_id) {
      const sql = "UPDATE courses " + "SET is_deleted = 1 " + "WHERE id = $course_id;";
      const params = { $course_id: course_id };

      try {
         this.db.run(sql, params);

         return true;
      } catch (e) {
         return e;
      }

   }




   /**
    * Returns all users associated with a course.
    * @param {Number} course_id The course's ID number (integer).
    * @returns {Promise} Resolves with all users in the course if successful; rejects otherwise. 
    */
   courseUsers(course_id) {
      return new Promise((resolve, reject) => {
         let sql = "SELECT u.name, u.login, cu.* "
            + " FROM course_users cu "
            + " INNER JOIN users u ON cu.user_id = u.id "
            + " WHERE course_id = $course_id "
            + " ORDER BY u.name";
         this.db.all(sql, { $course_id: course_id }, (err, rows) => {
            if (err === null && rows !== undefined) {
               resolve(rows);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else {
               reject(false);
            }
         });
      });
   }

   /**
    * Returns all courses that the user is taking. 
    * @param {Number} user_id The user's ID number (integer). 
    * @returns {Promise} Resolves with all courses that this user is taking if successful;
    *    rejects otherwise.
    */
   forUser(user_id) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM courses c " +
            " INNER JOIN course_users cu ON c.id = cu.course_id " +
            " WHERE cu.user_id = $user_id";
         this.db.all(sql, { $user_id: user_id }, (err, rows) => {
            if (err === null && rows !== undefined) {
               resolve(rows);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else {
               reject(false);
            }
         });
      });
   }

   /** 
    * Ensures that the combination of school, name, term, and year are all unique.
    * @param {Number} school_id The school's ID number (integer).
    * @param {String} name A course's name. 
    * @param {String} term The term in which the course is held.
    * @param {Number} year The year in which the course is held (integer).
    * @returns {Promise} Resolves with true if the combination of these arguments is unique in the database;
    *    rejects with false otherwise. 
    */
   isUnique(school_id, name, term, year) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM courses "
            + "WHERE school_id = $id "
            + "AND name = $name "
            + " AND term = $term "
            + "AND year = $year "
            + "AND is_deleted=0 ";
         this.db.get(sql, { $id: school_id, $name: name, $term: term, $year: year }, (err, row) => {
            if (err === null && row !== undefined) {
               reject(false);
               return;
            }
            else if (err !== null) {
               console.log(err);
            }
            resolve(true);
         });
      });
   }

   /**
    * Removes the user from the selected course. 
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The user's ID number (integer).
    * @returns {Promise} Resolves with the number of rows deleted if successful;
    *    rejects with error otherwise. 
    */
   removeUser(course_id, user_id) {
      const sql = "DELETE FROM course_users WHERE course_id = $course_id AND user_id = $user_id";
      const params = { $course_id: course_id, $user_id: user_id }

      return new Promise((resolve, reject) => {

         //AC: placing db callback function into its own variable changes 
         //*this* from local object to result of sqlite3 db call.
         var local_callback = function (err) {
            if (err === null) {
               resolve(this.changes);
            }
            else {
               console.log(err);
               reject(err);
            }
         };
         this.db.run(sql, params, local_callback);
      });
   }

   /**
    * Sets the given user's role in the course.
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The user's ID number (integer).
    * @param {Number} role Integer representing a role, specified by these bits: 
    *    00001 = is pending user, 
    *    00010 = can submit assignment,
    *    00100 = can modify course,
    *    01000 = can grade assignments,
    *    10000 = is creator
    * @returns {Promise} Resolves with the number of rows affected if successful; 
    *    rejects with error otherwise. 
    */
   setCourseRole(course_id, user_id, role) {

      // Prevent creator from being locked out of own course
      const promise = this.isCreator(course_id, user_id)
         .then(result => {
            if (result && (role < 20)) {
               throw "CANNOT REMOVE PRIVELEGES FROM COURSE OWNER";
            }
         })
         .catch(err => {
            role = 20;
            console.log(err);
         })
         .then(() => {


            const sql = "UPDATE course_users SET course_role = $role WHERE course_id = $course_id AND user_id = $user_id";
            const params = { $course_id: course_id, $user_id: user_id, $role: role }

            return new Promise((resolve, reject) => {

               //AC: placing db callback function into its own variable changes 
               //*this* from local class object to result of sqlite3 db call.
               var local_callback = function (err) {
                  if (err === null) {
                     resolve(this.changes);
                     return;
                  }
                  else {
                     console.log(err);
                     reject(err);
                     return;
                  }
               };
               this.db.run(sql, params, local_callback);
            });
         })
         .catch(console.log);

      return promise;
   }
}

/**
 * Contains methods for altering course-related information in the database.
 * @typedef {Object} CoursesDb
 */

/**
 * Creates a new CoursesDb object.
 * @param {Object} db_connection Database connection.
 * @returns {CoursesDb} Instance of CoursesDb.
 */
exports.createCoursesDb = function (db_connection) {
   return new CoursesDb(db_connection);
}