import React, { Component } from 'react';
import { connect } from "react-redux";
import { Route, NavLink, Redirect, withRouter } from 'react-router-dom';
import CourseAssignmentSelector from '../components/CourseAssignmentSelector';
import './index.css'; 

//components
import AddFiles from './components/AddFilesComponent';
import DeleteFile from './components/DeleteFileComponent'; 
import Source from './components/SourceViewComponent';
import TestCases from './components/TestCasesComponent';
import ManageTests from './components/ManageTestsComponent';
import Results from './components/ResultsComponent';
import BulkResults from './components/BulkResultsComponent'
import Description from './components/DescriptionComponent';
import GithubRepoLink from './components/GithubRepoLinkComponent';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

//AC Idea: have a separate dropdown for graders / instructors that allows them to toggle between students

class IndexView extends Component {

   constructor(props) {
      super(props);

      this.base_links =
         [{
            id: -1,
            url: "/assignment/add-files",
            name: "Add File(s)",
            css: "nav-link"
         },
         {
            id: -1, 
            url: "/assignment/description", 
            name: "Description", 
            css: "nav-link"
         },
         {
            id: -1,
            url: "/assignment/run",
            name: "Run",
            css: "nav-link"
         },
         {
            id: -1,
            url: "/assignment/results",
            name: "Results",
            css: "nav-link"
         }
         ];
      this.state = {
         links: this.base_links,
         files: [],
         file_data: {},
         has_modify_permissions: false, 
         current_assignment: { id: -1 },
         see_delete_popup: false,
         selected_file: null,  
         selected_user: this.props.current_user,
         selected_user_index: 0,
         student_roster: []
      };

      this.onAssignmentChange = this.onAssignmentChange.bind(this);
      this.updateFiles = this.updateFiles.bind(this);
      this.getAssignmentFiles = this.getAssignmentFiles.bind(this);
      this.getCourseUsers = this.getCourseUsers.bind(this);
      this.removeTab = this.removeTab.bind(this);
      this.render = this.render.bind(this);
      this.renderStudentSelector = this.renderStudentSelector.bind(this);
      this.selectedUser = this.selectedUser.bind(this);
      this.toggleDeletePopup = this.toggleDeletePopup.bind(this); 
      this.updateSelectedStudent = this.updateSelectedStudent.bind(this);
   }

   selectedUser() {
      if (this.state.selected_user.id === -1) {
         return this.props.current_user;
      }
      return this.state.selected_user;
   }

   onAssignmentChange(assignment) {
      this.setState({ current_assignment: assignment }, () => {
         this.getAssignmentFiles();
         this.getCourseUsers();
      });
   }

   

   getCourseUsers() {
      let self = this;
      this.props.models.course.getCourseUsers(this.state.current_assignment.course_id)
         .then((result) => {
            let active_users = [];

            //add current user
            active_users.push(this.props.current_user); 

            //filter course users based on access rights
            for (let user of result) {
               const privilege = this.props.models.course.getCoursePrivileges(user.course_role);
               if (privilege.can_submit_assignment === true && privilege.can_grade_assignment === false) {

                  //request returns course users, which are different than vanilla users.  Course users have
                  //user_id whereas vanilla has just id.  So we need to make a copy to make everything work out 
                  //okay.
                  user.id = user.user_id;

                  active_users.push(user);
               }
               if (user.user_id === self.props.current_user.id)
               {
                  // add our own course privileges to roster  
                  active_users[0].course_role = user.course_role; 
                  if(privilege.can_modify_course === true)
                  {
                     self.setState({has_modify_permissions: true}, () => {
                        self.updateTabs();
                     })
                  }
               }
            }
            self.setState({ student_roster: active_users });
         })
         .catch(err => { console.log(err); });
   }

   getAssignmentFiles() {
      const selected_user = this.selectedUser();
      if (selected_user.id > 0 && this.state.current_assignment.id > 0) {
         this.props.models.assignment.getFiles(this.state.current_assignment.id, selected_user.id)
            .then((result) => {
               this.setState({ file_data: result.data, files: result.links }, () => {
                  this.updateTabs();
               });
            })
            .catch(() => { });
      }
   }

   addInstructorTabs() {
      let links = this.state.links; 
      
      // add a tab to manage test cases if current user has permission
      if(this.state.has_modify_permissions === true) {
         const test_id = -1; 
         const test_url = "/assignment/tests"; 
         const test_name = "Manage Tests"; 
         const test_tab = {id: test_id, url: test_url, name: test_name, css: "nav-link instructor"};
         
         const results_id = -1; 
         const results_url = "/assignment/bulk-results"; 
         const results_name = "Student Results"; 
         const results_tab = {id: results_id, url: results_url, name: results_name, css: "nav-link instructor"}; 

         // insert instructor tabs after all other tabs 
         links.push(test_tab); 
         links.push (results_tab); 
      }
      this.setState({links: links}); 
   }

   updateTabs() {
      let links = [...this.base_links];
      let links_by_name = {};

      // add tabs for each file 
      const files = this.state.files;
      for (let key of Object.keys(files)) {
         const file = files[key];
         const url = "/assignment/files/" + file.name.toLowerCase();
         const tab = { id: file.id, url: url, name: file.name, css: "nav-link" };
         links_by_name[tab.url] = tab;
      }
      for (let key of Object.keys(links_by_name)) {
         links.push(links_by_name[key]);
      }
      this.setState({ links: links }, () => {
         this.addInstructorTabs();
      });
   }

   updateFiles(files) {
      let previous_files = { ...this.state.files };
      for (let file of files) {
         previous_files[file.name] = file;
      }
      this.setState({ files: previous_files }, () => {
         this.updateTabs();
         this.getAssignmentFiles();
      });
   }

   removeTab(file_name) {
      let files = { ...this.state.files };
      delete files[file_name];
      this.setState({ files: files }, () => {
         this.updateTabs();
      });
   }

   toggleDeletePopup(file) {
      if(file !== undefined) {
         this.setState({ selected_file: file });
      }
      else {
         this.setState({ selected_file: null}); 
      }
      this.setState({
         see_delete_popup: !this.state.see_delete_popup
      });
   }

   updateSelectedStudent(evt) {
      const selected_index = Number(evt.target.value);
      this.setState({
         selected_user_index: selected_index,
         selected_user: this.state.student_roster[selected_index]
      }, () => {
         this.getAssignmentFiles();
      });
   }

   renderStudentSelector() {
      if (this.state.student_roster.length > 0) {
         return (
            <React.Fragment>
               Student: <select value={this.state.selected_user_index} onChange={this.updateSelectedStudent}>
                  {this.state.student_roster.map((value, index) =>
                     <option key={index} value={index}>{value.name}</option>
                  )}
               </select>
            </React.Fragment>
         );
      }
   }

   render() {
      const links = this.state.links;
      const state = this.state;
      const self = this;
      const current_path = this.props.location.pathname; 
      
      let initial_assignment;
      
      if (current_path.search(/\d/) > 0) {
         initial_assignment = current_path.substring(current_path.search(/\d/));
         console.log(initial_assignment);

      }

      
      return (
         <div>
            <Redirect to="/assignment/add-files" />
            <article className="row">
               <CourseAssignmentSelector
                  onAssignmentChange={this.onAssignmentChange} initial_assignment={initial_assignment} class_name="col-md-3" />
               <div className="col-md-3">
                  {this.renderStudentSelector()}
               </div>
            </article>
            <div>
               <nav>
                  <ul className="nav nav-tabs">
                     {Object.keys(links).map((key) => {
                        const item = links[key];
                        let style = item.css; 
                        return (
                           <li key={item.url} className="nav-item">
                              <NavLink
                                 to={item.url}
                                 className={style}
                                 activeClassName="active">
                                 {item.name} 
                                 {(item.id > 0) ? <span className="close" onClick={() => this.toggleDeletePopup(item)}>&times;</span> : ''}
                              </NavLink>
                           </li>
                        );
                     })}
                  </ul>
               </nav>
               {this.state.see_delete_popup ? 
                  <DeleteFile toggle={this.toggleDeletePopup} assignment={this.state.current_assignment} selected_file={this.state.selected_file} /> 
                  : null}
               <Route path="/assignment/files/:name"
                  render={
                     ({ match }, props) => {
                        const file_name = match.params.name;
                        const file_data = state.file_data[file_name];
                        return (
                           <div className="container">
                              <Source
                                 source={file_data}
                              />
                           </div>
                        )
                     }
                  } />
               <Route path="/assignment/add-files"
                  render={
                     (props) => {
                        //if an alternate user is selected (e.g. for grading), then 
                        //the user shouldn't be allowed to add files.  Redirect to the results screen,
                        //which is likely where they want to be anyway.
                        if (self.selectedUser().id === self.props.current_user.id) {
                           return (
                              <div className="container">
                              
                                 <GithubRepoLink assignment_id={this.state.current_assignment.id} props={self.props}/>
                              </div>
                           )
                        }
                        else {
                           return (<Redirect to="/assignment/results" />)
                        }

                     }} />
                  <Route path="/assignment/description"
                  render={
                     (props) => {
                        return (
                           <div className="container">
                              <Description assignment={this.state.current_assignment} />
                           </div>
                        )
                     }} />
               <Route path="/assignment/run"
                  render={
                     (props) => {
                        return (
                           <div className="container">
                              <TestCases 
                                 assignment={this.state.current_assignment} 
                                 selected_user={this.state.selected_user}
                                 getAssignmentFiles={this.getAssignmentFiles}
                              />
                           </div>
                        )
                     }} />
               <Route path="/assignment/results"
                  render={
                     (props) => {
                        return (
                           <div className="container">
                              <Results
                                 assignment={this.state.current_assignment}
                                 user={this.selectedUser()}
                              />
                           </div>
                        )
                     }} />
               <Route path="/assignment/tests"
                  render={
                     (props) => {
                        return (
                           <div className="container">
                              <ManageTests
                                 assignment={this.state.current_assignment}
                                 user={this.selectedUser()}
                                 modify_permissions={this.state.has_modify_permissions}
                              />
                           </div> 
                        )
                     }} />
               <Route path="/assignment/bulk-results"
                  render={
                     (props) => {
                        return (
                           <div className="container">
                              <BulkResults
                                 assignment={this.state.current_assignment}
                                 user={this.selectedUser()}
                                 student_roster={this.state.student_roster}
                                 modify_permissions={this.state.has_modify_permissions}
                              />
                           </div> 
                        )
                     }} />
            </div>
         </div>
      );
   }
}

const Index = connect(mapStateToProps)(IndexView);
export { Index };
export default withRouter(Index);