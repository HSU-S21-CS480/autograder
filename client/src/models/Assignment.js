import WebRequest from '../view_models/WebRequest.js';

class Assignment {
   constructor(site_config, cache_results = false) {
      this.config = site_config;
      this.cache_results = cache_results;

      this.getFiles = this.getFiles.bind(this);
      this.getTestCases = this.getTestCases.bind(this);
      this.run = this.run.bind(this);
      this.compile = this.compile.bind(this);
      this.submitAssignment = this.submitAssignment.bind(this);
      this.lockAssignment = this.lockAssignment.bind(this);
      this.linkRepository = this.linkRepository.bind(this);
   }

   removeFile(file, assignment_id) {
      return new Promise((resolve, reject) => {
         const path = this.config.endpoints.assignment.file;
         const endpoint = this.config.constructRoute(path, [assignment_id]);
         WebRequest.makeDelete(endpoint, { id: file.id }, (result) => {
            if (result !== null && result !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result.data.response);
            }
         });
      });
   }

   getFiles(assignment_id, user_id) {
      return new Promise((resolve, reject) => {
         const endpoint = this.config.endpoints.assignment.user_files; 
         const url = this.config.constructRoute(endpoint, [assignment_id, user_id]);
         WebRequest.makeUrlRequest(url, (result) => {
            if (result !== null && result !== undefined) {
               const data = result.data.response;
               let file_data = {};
               let file_links = [];
               for (const item of data) {
                  item.type = "text/plain";
                  item.lastModified = 0;
                  item.name = item.file_name;
                  file_data[item.file_name] = item;
                  file_links.push(item);
               }
               resolve({ data: file_data, links: file_links });
            }
            else {
               reject(false);
            }
         });
      });

   }


   downloadFiles(assignment_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.download_files;
         const endpoint = this.config.constructRoute(path, [assignment_id]); 
         call(endpoint, (result) => {
            if (result !== null && result !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   downloadResults(assignment_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.download_results;
         const endpoint = this.config.constructRoute(path, [assignment_id]); 
         call(endpoint, (result) => {
            if (result !== null && result !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   getGradingFilesLink(assignment_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.grading_files_link; 
         const endpoint = this.config.constructRoute(path, [assignment_id]); 
         call(endpoint, (result) => {
            if (result !== null && result.data !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   getTestCases(assignment_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.test_cases; 
         const endpoint = this.config.constructRoute(path, [assignment_id]); 
         call(endpoint, (result) => {
            if (result !== null && result.data.response !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   editTestCase(assignment_id, test_id, test_name, test_input, test_desc) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePut;
         const path = this.config.endpoints.assignment.test_cases; 
         const endpoint = this.config.constructRoute(path, [assignment_id]);
         call(endpoint, { test_id: test_id, test_name: test_name, test_input: test_input, test_description: test_desc }, (result) => {
            if (result !== null && result !== undefined && result.data.response !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }
         });
      });
   }

   createTestCase(assignment_id, test_id, test_name, test_input, test_desc) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePost;
         const path = this.config.endpoints.assignment.test_cases; 
         const endpoint = this.config.constructRoute(path, [assignment_id]); 
         call(endpoint, { test_id: test_id, test_name: test_name, test_input: test_input, test_description: test_desc }, (result) => {
            if (result !== null && result !== undefined && result.data.response !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }
         });
      });
   }

   editTestCase(assignment_id, test_id, test_name, test_input, test_desc) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePut;
         const path = this.config.endpoints.assignment.test_cases; 
         const endpoint = this.config.constructRoute(path, [assignment_id]);
         call(endpoint, { test_id: test_id, test_name: test_name, test_input: test_input, test_description: test_desc }, (result) => {
            if (result !== null && result !== undefined && result.data.response !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }
         });
      });
   }

   createTestCase(assignment_id, test_id, test_name, test_input, test_desc) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePost;
         const path = this.config.endpoints.assignment.test_cases; 
         const endpoint = this.config.constructRoute(path, [assignment_id]); 
         call(endpoint, { test_id: test_id, test_name: test_name, test_input: test_input, test_description: test_desc }, (result) => {
            if (result !== null && result !== undefined && result.data.response !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }
         });
      });
   }

   getTestResults(assignment_id, user_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.test_results;
         const endpoint = this.config.constructRoute(path, [assignment_id, user_id]); 
         call(endpoint, (result) => {
            if (result !== null && result !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   run(assignment_id, user_id, test_case, test_name) {
      return this.compile(assignment_id, user_id, test_case, test_name, true);
   }

   compile(assignment_id, user_id, test_case, test_name, run_only = false) {
      return new Promise((resolve, reject) => {

         //never allow caching of compile calls
         let call = WebRequest.makePost;
         let path = this.config.endpoints.assignment.compile; 
         if (run_only === true) {
            path = this.config.endpoints.assignment.run; 
         }
         const endpoint = this.config.constructRoute(path, [assignment_id, user_id]);
         call(endpoint, { stdin: test_case, test_name: test_name }, (result) => {
            if (result !== null && result.data.response !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

   submitAssignment(assignment_id, user_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePost;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.submit_assignment;
         const endpoint = this.config.constructRoute(path, [assignment_id, user_id]); 
         call(endpoint, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }
         });
      });
   }


   async linkRepository(assignment_id, url) {
      try {
         const path = this.config.endpoints.assignment.repo;
         const endpoint = this.config.constructRoute(path, [assignment_id])
         const result = await WebRequest.makePostAsync(endpoint, {url: url});
         return result.data.response;
      } 
      catch (e) {
         console.log(e);
      }
      
   }

   lockAssignment(assignment_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makePost;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.lock_assignment;
         const endpoint = this.config.constructRoute(path, [assignment_id]);
         call(endpoint, (result) => {
            if (result !== null && result !== undefined && Object.keys(result.data.response).length > 0) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }
         });
      });
   }

   isLocked(assignment_id) {
      return new Promise((resolve, reject) => {
         let call = WebRequest.makeUrlRequest;
         if (this.cache_results === true) {
            call = WebRequest.makeCacheableUrlRequest;
         }
         const path = this.config.endpoints.assignment.is_locked;
         const endpoint = this.config.constructRoute(path, [assignment_id]); 
         call(endpoint, (result) => {
            if (result !== null && result !== undefined) {
               resolve(result.data.response);
            }
            else {
               reject(result);
            }

         });
      });
   }

}

export { Assignment };
export default Assignment;