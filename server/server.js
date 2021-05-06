// server.js

//tutorials:
//express: https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4 
//sqlite3: http://www.sqlitetutorial.net/sqlite-nodejs/

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const ini = require('ini');
const session = require('express-session');
const FileManager = require('./FileManager.js');
const Database = require('./Models/Database.js');
const AccessControlList = require('./Models/AccessControlList.js');
var FolderSetup = require('./setup.js');
var OAuthConfig = require('./oauthconfig.json');
var Compiler = require('./Models/Compiler.js');

var FileStore = require('session-file-store')(session);

// require modules for API routes 
const userRoute = require('./Routes/user.js'); 
const assignmentRoute = require('./Routes/assignment.js'); 
const courseRoute = require('./Routes/course.js'); 

let config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));

config.database.connection_string = config.database.db_path + config.database.db_name;
let file_manager = FileManager.FileManager(config.temp_path, config.uploads_path);
let all_folders = [config.temp_path, config.uploads_path];
let folder_setup = FolderSetup.setupFolders(all_folders);
let db = Database.createDatabase(config.database.connection_string, config.database.secret_hash, config.database.crypto_method);
let acl = AccessControlList.createACL(db);

//let mail_config = ini.parse(fs.readFileSync('./config.mail.ini', 'utf-8'));
//let mail_api_key = mail_config.api_key;

/* 
process.on('unhandledRejection', (reason, p) => {
   console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
   // application specific logging, throwing an error, or other logic here
 });
 */

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

let cookie = { secure: false, httpOnly: false };
app.use(session({
   store: new FileStore({ path: config.session_path, ttl: 86400 }),
   secret: config.database.secret_hash,
   resave: false,
   saveUninitialized: false,
   cookie: cookie
}));

var port = process.env.PORT || 8080;        // set our port

if (config.mode === "debug") {
   console.log("running in debug mode.");
}

app.use((req, res, next) => {

   //Allow CORS from react (not safe for production)
   if (config.mode === "debug") {
      const origin = req.get('origin');
      res.header('Access-Control-Allow-Origin', origin);
   }

   res.header('Access-Control-Allow-Credentials', true);
   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD, OPTIONS');
   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');

   // intercept OPTIONS method
   if (req.method === 'OPTIONS') {
      res.sendStatus(204);
   } else {
      next();
   }
});


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', (req, res) => {
   res.json({ message: 'hooray! welcome to our api!' });
});

// get test cases for the given assignment 
router.get('/assignment/:assignment_id/testCases', (req, res) => assignmentRoute.getTestCases(req, res, db)); 

// download student results for given assignment
router.get('/assignment/:assignment_id/downloadResults', (req, res) => assignmentRoute.downloadResults(req, res, db, acl)); 

// download student files for given assignment
router.get('/assignment/:assignment_id/downloadFiles', (req, res) => assignmentRoute.downloadFiles(req, res, db, acl)); 

// downloads and zips up student results and files for the given assignment 
router.get('/assignment/:assignment_id/zipGradingFiles', (req, res) => assignmentRoute.zipGradingFiles(req, res, db, acl)); 

// returns a link to the API endpoint where you can download grading files 
router.get('/assignment/:assignment_id/gradingFilesLink', (req, res) => assignmentRoute.getGradingDownloadURL(req, res, db, acl)); 

// mark an assignment as submitted
router.post('/assignment/:assignment_id/user/:user_id/submitAssignment', (req,res) => assignmentRoute.submitAssignment(req,res,db,acl));

// toggle an assignment's locked status
router.post('/assignment/:assignment_id/lockAssignment', (req,res) => assignmentRoute.lockAssignment(req,res,db, acl));

//get an assignment's locked status
router.get('/assignment/:assignment_id/isLocked', (req,res) => assignmentRoute.isLocked(req,res,db));

// create a test case for the given assignment 
router.post('/assignment/:assignment_id/testCases', (req, res) => assignmentRoute.createTestCase(req, res, db, acl));

// edits a test case for the given assignment 
router.put('/assignment/:assignment_id/testCases', (req, res) => assignmentRoute.editTestCase(req, res, db, acl)); 

// gets user's test results for this assignment, if the user has permission
// to view them 
router.get('/assignment/:assignment_id/user/:user_id/testResults', (req, res) => assignmentRoute.getTestResults(req, res, db, acl)); 

//runs student's code without compiling first (saves time)
router.post('/assignment/:assignment_id/user/:user_id/run', (req, res) => assignmentRoute.run(req, res, db, config, acl, Compiler)); 

//compiles & runs student's code
router.post('/assignment/:assignment_id/user/:user_id/compile', (req, res) => assignmentRoute.compileAndRun(req, res, db, config, acl, Compiler)); 

// Retrieves all files for the specified assignment and user (if allowed to grade)
router.get('/assignment/:aid/user/:uid/file', (req, res) => assignmentRoute.assignmentFiles(req, res, db, acl)); 

// Uploads a file. :aid is the assignment ID that this file will belong to;
router.post('/assignment/:aid/file', (req, res) => assignmentRoute.uploadFile(req, res, db, acl)); 


// Stores a URL pointing to student git repository. 
// :aid is the assignment ID that this file will belong to;
router.post('/assignment/:aid/repo', (req, res) => assignmentRoute.addRepository(req, res, db, acl)); 

// Deletes a file. The file ID to delete should be in req.body.id.
router.delete('/assignment/:aid/file', (req, res) => assignmentRoute.deleteFile(req, res, db, acl)); 

//Returns all available courses
router.get('/course', (req, res) => courseRoute.courses(req, res, db)); 

// Creates a course. 
router.post('/course', (req, res) => courseRoute.createCourse(req, res, db, acl));

// Flags course as inactive
router.put('/course/:course_id/archive', (req, res) => courseRoute.archiveCourse(req, res, db, acl));

// Flags course as active
router.put('/course/:course_id/reinstate', (req, res) => courseRoute.reinstateCourse(req, res, db, acl));

// Flags course as deleted
router.put('/course/:course_id/delete', (req, res) => courseRoute.deleteCourse(req, res, db, acl));

// returns all assignments from the given course 
router.get('/course/:id/assignments', (req, res) => courseRoute.assignments(req, res, db)); 

// returns all active assignments from the given course 
router.get('/course/:id/assignments/active', (req, res) => courseRoute.activeAssignments(req, res, db));

// returns all inactive assignments from the given course 
router.get('/course/:id/assignments/inactive', (req, res) => courseRoute.inactiveAssignments(req, res, db)); 

// Returns all courses that the currently logged in user is taking
router.get('/course/enrolled', (req, res) => courseRoute.enrollments(req, res, db));


// Returns a detailed roster for this course if the user has instructor rights
router.get('/course/:course_id/user', (req, res) => courseRoute.roster(req, res, db, acl)); 

// Removes the user specified in req.body from the selected course if
// they are the current session user
router.delete('/course/:course_id/user', (req, res) => courseRoute.removeUser(req, res, db, acl)); 

// Adds the user to the specified course
router.post('/course/:course_id/user', (req, res) => courseRoute.addUser(req, res, db, acl)); 

// Alters user's course role
router.put('/course/:course_id/user', (req, res) => courseRoute.editRole(req, res, db, acl)); 

// Allows bulk user creation and addition to course. 
// TODO: change to work with new GitHub login
router.post('/course/:course_id/addRoster', (req, res) => courseRoute.addRoster(req, res, db, acl)); 

// returns information on currently logged in user
router.get('/user/login', (req, res) => userRoute.info(req, res)); 

// logs in a user with given credentials 
router.post('/user/login', (req, res) => userRoute.oldLogin(req, res, db)); 

// returns information on currently logged-in user from Github
router.get('/user/githubUser', (req, res) => userRoute.githubUser(req, res, db)); 

// logs out user 
router.get('/user/logout', (req, res) => userRoute.logout(req, res)); 

// creates new user
router.post('/user/create', (req, res) => userRoute.createUser(req, res, db)); 

// logs in current GitHub user
router.get('/user/oauth', (req, res) => userRoute.oauth(req, res, db, OAuthConfig));

// creates new user
router.post('/user/oldCreate', (req, res) => userRoute.oldCreateUser(req, res, db)); 


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api

app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server running on port ' + port);

