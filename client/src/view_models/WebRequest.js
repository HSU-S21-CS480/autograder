import axios from 'axios';

class WebRequest {

   /**
    * Makes a GET web request that will be cached in future calls (currently no expiration)
    * @param {*} url 
    * @param {*} callback 
    */
   static makeCacheableUrlRequest(url, callback) {
      if (sessionStorage.getItem(url) === null) {
         axios(url, { withCredentials: true }).then(result => {
            sessionStorage.setItem(url, JSON.stringify(result));
            callback(result);
         });
      }
      else {
         callback(JSON.parse(sessionStorage.getItem(url)));
      }
   }

   /**
    * Makes a GET web request without caching the result.
    * @param {*} url 
    * @param {*} callback 
    */
   static makeUrlRequest(url, callback) {
      axios(url, { withCredentials: true }).then(result => {
         callback(result);
      });
   }

   static async makeRequestAsync(url) {
      const result = await axios(url, { withCredentials: true });
      return result;
   }
   

   static makePost(url, post, callback) {
      axios(url, {
         method: "post",
         data: post,
         withCredentials: true
      })
         .then(callback);
   }

   static async makePostAsync(url, post) {
      const result = await axios(url, {
         method: "post",
         data: post,
         withCredentials: true
      })
      return result;
   }

   static makeDelete(url, data, callback){
      axios(url, {
         method: "delete",
         data: data,
         withCredentials: true
      })
         .then(callback);
   }

   static makePut(url, data, callback){
      axios(url, {
         method: "put",
         data: data,
         withCredentials: true
      })
         .then(callback);
   }

   static async makePutAsync(url, data) {
      const result = await axios(url, {
         method: "put",
         data: data,
         withCredentials: true
      })
      return result;
   }
}

export { WebRequest };
export default WebRequest;