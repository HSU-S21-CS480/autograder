class AccessControlList {

   /**
    * AccessControlList constructor.
    * @param {*} db The database connection. 
    */
   constructor(db) {
      this.db = db;

      this.canCreateCourses = this.canCreateCourses.bind(this);
      this.canGradeAssignment = this.canGradeAssignment.bind(this); 
      this.canModifyCourse = this.canModifyCourse.bind(this);
      this.isAdmin = this.isAdmin.bind(this);
      this.isLoggedIn = this.isLoggedIn.bind(this);
      this.isSessionUser = this.isSessionUser.bind(this); 
      this.userHasAssignment = this.userHasAssignment.bind(this);
      this.userOwnsFile = this.userOwnsFile.bind(this);
   }

   /**
    * Resolves with true if the user can grade assignments for the given course.
    * @param {Object} user
    * @param {Number} course_id The course's ID number (integer).
    * @returns {Promise} Promise object represents the result of calling canGrade().
    */
   canGradeAssignment(user, course_id){
      return new Promise((resolve, reject) => {
         this.db.Courses.canGrade(course_id, user.id)
         .then(result => 
            resolve(result))
         .catch(err => 
            reject(err));
      });
   }

   /**
    * Resolves with true if user can modify the given course.
    * @param {Object} user
    * @param {Number} course_id The course's ID number (integer).
    * @returns {Promise} Promise object represents the result of calling canModify().
    */
   canModifyCourse(user, course_id) {
      return new Promise((resolve, reject) => {
         this.db.Courses.canModify(course_id, user.id)
         .then(result => resolve(result))
         .catch(err => reject(err));
      });
   }



   /**
    * Resolves with true if user can modify the given course.
    * @param {Object} user
    * @param {Number} course_id The course's ID number (integer).
    * @returns {Promise} Promise object represents the result of calling canModify().
    */
    canSubmitAssignment(user, course_id) {
      return new Promise((resolve, reject) => {
         this.db.Courses.canSubmitAssignment(course_id, user.id)
         .then(result => resolve(result))
         .catch(err => reject(err));
      });
   }


   /**
    * Resolves with true if user can modify the given course.
    * @param {Number} course_id The course's ID number (integer).
    * @param {Number} user_id The user's ID number (integer).
    * @returns {Promise} Promise object represents the result of calling isCreator().
    */
   async isCreator(course_id, user_id) {
      try {
         const result = await this.db.Courses.isCreator(course_id, user_id);
         return result;
      } catch (err) {
         console.log(err);
         return err;
      }
      
   }

   /**
    * Resolves with true if the current user can create courses.
    * @param {*} session Current session.
    * @returns {Promise} Promise object represents the result of calling isAdmin().
    */
   canCreateCourses(session) {

      //no "teacher" level so same as admin for now
      return isAdmin(session);
   }

   /**
    * Resolves with true if the current user is an admin.
    * @param {*} session Current session.
    * @returns {Promise} Resolves to true if the user is an admin; rejects false otherwise.
    */
   isAdmin(session) {
      return new Promise((resolve, reject) => {
         if (session.user !== undefined
            && session.user !== null
            && session.user.is_admin === 1
         ) {
            resolve(true);
         }
         else {
            reject(false);
         }
      });
   }

   /**
    * Resolves with true if the current user is an admin or instructor.
    * @param {*} session Current session.
    * @returns {Promise} Resolves to true if the user is an admin; rejects false otherwise.
    */
    isAdminOrInstructor(session) {
      return new Promise((resolve, reject) => {
         if (session.user !== undefined
            && session.user !== null
            && (session.user.is_admin === 1
               || session.user.is_instructor === 1)
         ) {
            resolve(true);
         }
         else {
            reject(false);
         }
      });
   }

   /**
    * Resolves with true if a user is currently logged into the session.
    * @param {*} session Current session. 
    * @returns {Promise} Resolves to true if someone is currently logged in; rejects false otherwise.
    */
   isLoggedIn(session) {
      return new Promise((resolve, reject) => {
         if (session.user !== undefined && session.user !== null) {
            resolve(true);
         }
         else {
            reject(false);
         }
      });
   }

   /**
    * Resolves with true if the given user is logged into this session. 
    * @param {*} session Current session. 
    * @param {Number} user_id Given user's ID number (integer). 
    * @returns {Promise} Resolves to true if the given user is currently logged in; 
    *    rejects false otherwise.
    */
   isSessionUser(session, user_id) {
      user_id = Number(user_id);
      return new Promise((resolve, reject) => {
         if (session.user.id === user_id) {
            resolve(true);
         }
         else {
            reject(false);
         }
      });
   }

   /**
    * Resolves with true if user is attached to the given assignment.  
    * @param {Object} user The given user.
    * @param {Number} assignment_id Assignment's ID number (integer).
    * @returns {Promise} Represents the result of calling hasUser(); rejects false if this
    *    user doesn't have the assignment.
    */
   userHasAssignment(user, assignment_id) {
      return new Promise((resolve, reject) => {
         this.db.Assignments.hasUser(assignment_id, user.id)
            .then(result => {
               resolve(result);    
            })
            .catch(() => {
               reject(false); 
            });
      });
   }

   /**
    * Resolves with true if the user owns the given file.
    * @param {Object} user 
    * @param {Number} file_id The file's ID number (integer). 
    * @returns {Promise} Resolves with true if the user owns this file; rejects with false otherwise.
    */
   userOwnsFile(user, file_id) {
      return new Promise((resolve, reject) => {
        this.db.AssignmentFiles.get(file_id)
         .then(result => {
            if(result.owner_id == user.id) {
               resolve(true); 
            }
            else {
               reject(false); 
            }
         })
         .catch(() => {
            reject(false); 
         });
      });
   }
}

/**
 * An object containing methods to allow or deny users permission to 
 *    alter information in the database. 
 * @typedef {Object} AccessControlList
 */

/**
 * Creates a new AccessControlList.
 * @param {Object} db_connection Database connection.
 * @returns {AccessControlList} Instance of AccessControlList.
 */
exports.createACL = function (db_connection) {
   return new AccessControlList(db_connection);
}