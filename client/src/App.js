import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

//views
import AddFilesView from './views/AddFilesView.js';
import LoginView from './views/LoginView.js';

//view models
import WebRequest from './view_models/WebRequest.js';
import PrivateRoute from './view_models/PrivateRoute.js';
import Session from './view_models/Session.js';

import './App.css';
import ConfigManager from './config.js';

var config = ConfigManager.getConfig();

class App extends Component {

   constructor(props) {
      super(props);

      this.base_links = 
         [{
            id: -1,
            url: "/add-files",
            name: "Add File(s)",
            css: "nav-link"
         },
            {
               id: -1,
               url: "/test_cases",
               name: "Test Cases",
               css: "nav-link"
            }
         ];
      this.state = {
         links: this.base_links,
         files: [],
         active_tab: "/add-files",
         current_user: null,
         courses: [],
         assignments: [],
         current_course: 1, //dummy value that will need to be changed
         current_assignment: 1 //dummy value that will need to be changed
      };

      this.session = Session;

      this.setActiveLink = this.setActiveLink.bind(this);
      this.updateFiles = this.updateFiles.bind(this);
      this.updateCurrentUser = this.updateCurrentUser.bind(this);
      this.getCourseData = this.getCourseData.bind(this);
      this.getCourseAssignments = this.getCourseAssignments.bind(this);
      this.removeTab = this.removeTab.bind(this);
   }

   getCourseData(){
      WebRequest.makeCacheableUrlRequest(config.endpoints.course.for_user + "/" + this.state.current_user.id, (result) =>{
         //this.setState({courses: result});
         alert(result);
      });
   }

   getCourseAssignments(){
      WebRequest.makeUrlRequest(config.endpoints.course.active_assignments + "/" + this.state.current_course, (result) =>{
         this.setState({assignments: result});
      });
   }

   setActiveLink(evt) {
      const url = evt.target.pathname;
      this.setState({ active_tab: url });
   }

   updateCurrentUser(user){
      this.setState({current_user: user}, () => {this.getCourseData();});
      this.session.set("current_user", user);
   }

   updateTabs() {
      const files = this.state.files;
      let links = [...this.base_links];
      let links_by_name = {};
      for (let key of Object.keys(files)) {
         const file = files[key];
         const url = "/files/" + file.name.toLowerCase();
         const tab = { id: file.id, url: url, name: file.name, css: "nav-link" };
         links_by_name[tab.url] = tab;
      }
      for(let key of Object.keys(links_by_name)){
         links.push(links_by_name[key]);
      }
      this.setState({links: links});
   }

   updateFiles(files) {
      let previous_files = {...this.state.files};
      for(let file of files){
         previous_files[file.name] = file;
      }
      this.setState({ files: previous_files }, () => { this.updateTabs() });
   }

   removeTab(file_name){
      let files = {...this.state.files};
      delete files[file_name];
      this.setState({files: files}, () =>{
         this.updateTabs();
      });
   }

   render() {
      const links = this.state.links;
      const courses = this.state.courses;
      return (
         <div className="App">
            <select>
               {courses.map((item) =>{
                  return(
                     <option key={item}>item</option>
                  );
               })}
            </select>
            <Router>
               <div>
                  <nav>
                     <ul className="nav nav-tabs">
                        {Object.keys(links).map((key) => {
                           const item = links[key];
                           const active_tab = this.state.active_tab;
                           let style = "nav-link";
                           if (active_tab === item.url) {
                              style += " active";
                           }
                           return (
                              <li key={item.url} className="nav-item">
                                 <Link
                                    to={item.url}
                                    className={style}
                                    onClick={this.setActiveLink}
                                 >{item.name}</Link>
                              </li>
                           );
                        })}
                     </ul>
                  </nav>
                  <Route path="/add-files"
                     render={
                        (props) => {
                           return (
                              <div className="container">
                                 <AddFilesView
                                    server_endpoint={config.endpoints.assignment.file}
                                    file_add_callback={this.updateFiles}
                                    file_remove_callback={this.removeTab}
                                    files={this.state.files}
                                 />
                              </div>
                           )
                        }} />
                  <Route path="/login"
                     render={
                        (props) => {
                           return (
                              <div className="container">
                                 <LoginView
                                    server_endpoint={config.endpoints.user.login}
                                    update_user={this.updateCurrentUser}
                                 />
                              </div>
                           )
                        }} />
               </div>
            </Router>
         </div>
      );
   }
}


export default App;
