import React, { Component } from 'react';
import { FilePond, File, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import WebRequest from '../../view_models/WebRequest.js';
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

class AddFilesViews extends Component{

   constructor(props){
      super(props);
      this.pond = null;
      this.file_types = ['text/x-c', 'text/x-h', 'text/plain'];

      this.addFile = this.addFile.bind(this);
      this.removeFile = this.removeFile.bind(this);
      this.serverEndpoint = this.serverEndpoint.bind(this);
   }

   addFile(error, file){
      const add_callback = this.props.file_add_callback;
      if(error === null){
         let raw_file = file.file;
         raw_file.id = file.serverId;
         let files = [];
         files.push(raw_file);
         add_callback(files);
      }
   }

   serverEndpoint(){
      const assignment_id = 1; //this will get changed to a dynamic prop
      const serverEndpoint = this.props.server_endpoint + "/" + assignment_id;
      return serverEndpoint;
   }

   removeFile(raw_file){

      //file pond isn't sending delete messages to server correctly.  Manual hack
      //until I figure it out.
      const endpoint = this.serverEndpoint();
      const callback = this.props.file_remove_callback;
      WebRequest.makeDelete(endpoint, {id: raw_file.serverId}, function(){
         callback(raw_file.file.name);
      });
   }

   render(){
      const serverEndpoint = this.serverEndpoint();
      return(
         <div>
            <h1>Add Files</h1>
            <p>
               Add your project files here  Uploading files with the same name will overwrite existing files on the server.<br />
               Navigate away when you're done.                
            </p>
            <FilePond 
               ref={ref => this.pond = ref}
               allowMultiple={true} 
               server={{
                  url: serverEndpoint,
                  process: {
                     withCredentials: true
                  }
               }} 
               allowFileSizeValidation="true"
               maxFileSize="100KB"
               withCredentials = {true}
               onprocessfile={this.addFile}
               onremovefile={this.removeFile}
               />
         </div>
      );
   }
}

export {AddFilesViews};
export default AddFilesViews;