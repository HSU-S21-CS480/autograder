const fs = require('fs');
const { exec, execFile, spawn, onExit } = require('child_process');
const path = require("path");
const rmdir_rf = require('rimraf');
const util = require('util');
// custom function for "promisifying" fs.access, to avoid callback pyramid of doom
fs.access[util.promisify.custom] = (path, mode) => {
   return new Promise((resolve,reject) => {
      fs.access(path, mode, (err) => {
         if(err) reject(err);
         else resolve(); 
      });
   });
}
const access = util.promisify(fs.access); 

/**
 * Constructor for all compilers using Docker. 
 * @param {Object} db Database connection.
 * @param {String} workspace_path Path to directory containing files to compile and run. 
 * @param {Number} assignment_id This code's assignment's ID number (integer). 
 * @param {Number} student_id ID number of the user to whom this code belongs.
 * @param {String} docker_image_path Path to docker file to be used to compile and run the code
 * @param {String} compile_cmd Command for compiling this code. 
 * @param {String} stdin Input stream to be entered into code. 
 * @param {Number} [timeout=15000] 
 */
class Compiler {
   constructor(db, workspace_path, assignment_id, student_id, dockerfile_path, stdin, timeout = 15000) {
      this.db = db;
      this.workspace_path = workspace_path;
      this.assignment_id = assignment_id;
      this.student_id = student_id;
      this.dockerfile_path = dockerfile_path;
      this.assignment_workspace = this.workspace_path + "/" + assignment_id;
      this.student_workspace = this.assignment_workspace + "/" + student_id;
      this.before_run_workspace = this.student_workspace + "/before_run"; 
      this.after_run_workspace = this.student_workspace + "/after_run"; 
      this.stdin = stdin;
      this.timeout = timeout;
      this.image_name = "cpp_" + this.assignment_id + "_" + this.student_id;
      this.container_name = this.image_name + "_" + Date.now(); 
      this.stdout = ""; 

      this.begin = this.begin.bind(this);
      this.loadFiles = this.loadFiles.bind(this);
      this.buildDockerContainer = this.buildDockerContainer.bind(this); 
      this.runDockerContainer = this.runDockerContainer.bind(this);
      this.copyFilesFromContainer = this.copyFilesFromContainer.bind(this); 
      this.updateDatabase = this.updateDatabase.bind(this); 
      this.cleanUp = this.cleanUp.bind(this); 
      this.canRunFiles = this.canRunFiles.bind(this); 
   }

   /**
    * Start the process of compiling and running code.
    * @returns {Promise} Represents whether the code successfully compiled and ran. 
    *    Resolves with output from running code if successful, rejects with error 
    *    message otherwise. 
    */
   begin() {
      return new Promise((resolve, reject) => {
         this.loadFiles()
            .then(result => this.buildDockerContainer())
            .then(result => this.runDockerContainer())
            .then(result => this.copyFilesFromContainer())
            .then(result => this.updateDatabase())
            .then(result => this.cleanUp())
            .then(result => {
               resolve(this.stdout);
            })
            .catch(err => {
               reject(err);
            });
      });
   }

   /**
    * Step #1: Load files stored in DB onto local file system
    * @returns {Promise} Resolves with all files in addition to stdin.txt if 
    *    files were successfully loaded onto local file system. Rejects with
    *    error otherwise. 
    */
   loadFiles() {

      return new Promise((resolve, reject) => {

         //grab all files from the DB
         this.db.AssignmentFiles.all(this.assignment_id, this.student_id)
            .then(files => {
               if (files.length === 0) {
                  reject("No files found");
               }

               //add stdin as a file
               files.push({ file_name: "stdin.txt", contents: this.stdin });

               //add dockerfile
               files.push({ file_name: "Dockerfile", contents: fs.readFileSync(this.dockerfile_path + "/Dockerfile")});

               //add docker run command (to be used inside of docker container to run program)
               files.push({ file_name: "run.sh", contents: fs.readFileSync(this.dockerfile_path + "/run.sh")});

               //and throw them into a temp workspace
               let write_counter = 0;

               if (fs.existsSync(this.assignment_workspace) === false) {
                  fs.mkdirSync(this.assignment_workspace);
               }
               if (fs.existsSync(this.student_workspace) === false) {
                  fs.mkdirSync(this.student_workspace);
               }
               if (fs.existsSync(this.before_run_workspace) === false) {
                  fs.mkdirSync(this.before_run_workspace);
               }
               if (fs.existsSync(this.after_run_workspace) === false) {
                  fs.mkdirSync(this.after_run_workspace);
               }
               for (let file of files) {
                  const file_path = this.before_run_workspace + "/" + file.file_name;
                  file.path = file_path;
                  fs.writeFile(file_path, file.contents, { encoding: "utf8" }, (err) => {
                     if (!err) {
                        write_counter++;
                        if (write_counter === files.length) {
                           resolve(files);
                        }
                     }
                     else {
                        reject(err);
                     }
                  });
               }
            })
            .catch(err => {
               reject(err); 
            });
      });
   }

   /**
    * Builds docker container where code will be compiled and run.
    * @returns {Promise} Resolves with output from building docker container if successful.
    *    Rejects with error otherwise. 
    */
   buildDockerContainer() {
      return new Promise((resolve, reject) => {
         const absolute_path = path.resolve(this.before_run_workspace);
         const exe_command = "docker build " + absolute_path + " -t " + this.image_name;
         exec(exe_command, { timeout: this.timeout }, (err, stdout, stderr) => {
            if (!err) {
               resolve(stdout);
            }
            else {
               reject(err);
            }
         });
      });
   }

   /**
    * Runs docker container with untrusted code and copies any files created
    * to the local filesystem.
    * @returns {Promise} Resolves with the result of running container with 
    *    untrusted code if successful. Rejects with error otherwise. 
    */
   runDockerContainer() {
      return new Promise((resolve, reject) => {
         //docker timeout is in seconds whereas nodejs timeout is in milliseconds
         const docker_timeout = this.timeout / 1000;
         const exe_command = "docker run --name " + this.container_name + " " + this.image_name + " timeout " + docker_timeout + " sh -c './run.sh'"; 
         exec(exe_command, { timeout: this.timeout }, (err, stdout, stderr) => {
            if (!err) {
               this.stdout = stdout; 
               resolve(stdout);
            }
            else {
               reject(err);
            }
         });
      });
   }

   /**
    * Copies files from Docker container to local filesystem.
    * @returns {Promise} Resolves with output from command if successful. 
    *    Rejects with error otherwise. 
    */
   copyFilesFromContainer() {
      return new Promise((resolve, reject) => {
         // copy all files from /tmp workspace on container to local filesystem
         const after_run_path = path.resolve(this.after_run_workspace);
         const exe_command = "docker cp " + this.container_name + ":/tmp/. " + after_run_path;
         exec(exe_command, { timeout: this.timeout }, (err, stdout, stderr) => {
            if (!err) {
               resolve(stdout); 
            }
            else {
               reject(err);
            }
         });
      });
   }

   /**
    * Adds any files that were created when running code to database. 
    * @returns {Promise} Resolves if successful. Rejects with error otherwise. 
    */
   updateDatabase() {
      return new Promise((resolve, reject) => {
         const docker_filenames = ["Dockerfile", "run.sh", "stdin.txt", "output"];
         let after_run_filenames = fs.readdirSync(this.after_run_workspace);

         // for each file that exists in the workspace after executing code: 
         // upload it to the database only if it was created or modified during 
         // runtime, and it's not a Docker file 
         const promises = after_run_filenames.map(filename => {
            // skip processing if it's a Docker file 
            if(docker_filenames.includes(filename) === true) {
               return Promise.resolve(); 
            } 

            let before_run_path = path.resolve(this.before_run_workspace, filename);
            let after_run_path = path.resolve(this.after_run_workspace, filename);
            let before_stats = null; 
            let after_stats = fs.statSync(after_run_path); 

            // did file exist before running code?
            return access(before_run_path)
            .then(() => {
               // yes -- get its stats 
               before_stats = fs.statSync(before_run_path); 
            })
            .catch(() => {
               // no -- it's just been created  
               before_stats = null; 
            })
            .finally(() => {
               // if the file was created or modified during runtime, upload to db
               if((before_stats === null) || (before_stats.mtimeMs < after_stats.mtimeMs)) {
                  let contents = fs.readFileSync(after_run_path);
                  return this.db.AssignmentFiles.add(this.student_id, this.assignment_id, filename, contents); 
               }
            })
         });

         // clear workspaces after all files are added to db as needed
         Promise.all(promises)
         .then(() => {
            rmdir_rf(path.resolve(this.before_run_workspace), () => {
               rmdir_rf(path.resolve(this.after_run_workspace), () => {
                  resolve(); 
               }); 
            });
         })
         .catch(err => {
            // some file didn't get added to db properly 
            console.log(err); 
            reject(); 
         })
      });
   }

   // TODO: move temp workspace deletion here 
   /**
    * Deletes Docker container and temp workspaces.
    * @returns {Promise} Resolves with [TODO] if successful. Rejects with error 
    *    otherwise. 
    */
   cleanUp() {
      return new Promise((resolve, reject) => {
         // remove Docker container
         const exe_command = "docker rm " + this.container_name;
         exec(exe_command, { timeout: this.timeout }, (err, stdout, stderr) => {
            if (!err) {
               resolve(stdout);
            }
            else {
               reject(err);
            }
         });
      });
   }

   /**
    * If we're just testing the same program against multiple tests, it's wasteful to always
    * compile.  This function tells us if we can run an existing program without a compile
    * by checking to see if the necessary files already exist (i.e. main.exe)
    * @returns {Promise} Resolves with true if the necessary files to run this program already 
    *    exist. Otherwise, if the necessary files don't already exist, we can't run this 
    *    program, so it rejects with error. 
    */
   canRunFiles() {
      return new Promise((resolve, reject) => {

         reject(false);

         //TODO: docker container breaks this functionality.  Need to rewrite.
         const exe_path = this.student_workspace + "/main.exe";
         fs.access(exe_path, fs.constants.F_OK, (err) => {
            if (!err) {
               //create new testing file
               const file_path = this.student_workspace + "/stdin.txt";
               fs.writeFile(file_path, this.stdin, { encoding: "utf8" }, (err) => {
                  if (!err) {
                     resolve(true);
                  }
                  else {
                     reject(err);
                  }
               });
            }
            else {
               reject("main.exe does not exist");
            }
         });
      });
   }
}

/**
 * Contains methods for compiling and running C++ code in a Docker container.
 * @typedef {Object} Compiler 
 */

/**
 * Creates an instance of the compiler. 
 * @param {Object} db Database connection.
 * @param {String} workspace_path Path to directory containing files to compile and run. 
 * @param {Number} assignment_id This code's assignment's ID number (integer). 
 * @param {Number} student_id ID number of the user to whom this code belongs.
 * @param {String} tools_setup_cmd Command for setting up build tools. 
 * @param {String} compile_cmd Command for compiling this code. 
 * @param {String} stdin Input stream to be entered into code. 
 * @returns {Compiler} Compiler using Docker.
 */
exports.createCompiler = function (db, workspace_path, assignment_id, student_id, dockerfile_path, stdin) {
   return new Compiler(db, workspace_path, assignment_id, student_id, dockerfile_path, stdin);
}