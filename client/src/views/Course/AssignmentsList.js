import React, { Component } from 'react';
import { connect } from "react-redux";
import UserList from './../components/UserList'
import { Redirect } from 'react-router-dom';


const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

let create = false;

class AssignmentsListView extends Component {

   constructor(props) {
      super(props);

      this.state = {
         courses: [],
         selected_course: Number(this.props.match.params.id),
         current_course_roles: {},
         selected_assignment: -1,
         course_assignments: []
      };

      this.updateSelectedCourse = this.updateSelectedCourse.bind(this);
      this.formatCourseName = this.formatCourseName.bind(this);
      this.getAssignmentsForCourse = this.getAssignmentsForCourse.bind(this);
      this.getCourses = this.getCourses.bind(this);
      this.getCourseRole = this.getCourseRole.bind(this); 
      this.lockAssignment = this.lockAssignment.bind(this);
      this.viewAssignment = this.viewAssignment.bind(this);
      this.assignmentButtonClick = this.assignmentButtonClick.bind(this);
   }


   // Add the new assignment to the database
   async addAssignmentAsync(assignment, parent) {
      const user_id = parent.props.current_user.id;
      await parent.props.models.assignment.addAssignmentAsync(assignment,user_id);
      parent.getAssignmentsForCourse(user_id);
      create = false;
   }
   
   componentDidMount() {
      this.getCourses(this.props.current_user)
      .then(() => this.getCourseRole())
      .then(() => this.getAssignmentsForCourse());
   }

   componentWillReceiveProps(new_props) {
      this.getCourses(new_props.current_user.id);
   }

   assignmentButtonClick(evt) {
      const button_id = evt.target.dataset.id;
      if(this.state.course_assignments[button_id] === undefined) {
         // add request
         this.props.models.assignment.addUser(button_id, this.props.current_user.id)
         .then(() => {
            let course_assignments = { ...this.state.course_assignments};
            course_assignments[button_id] = { id: button_id };
            this.setState({course_assignments: course_assignments});
         })
         .catch((err) => { })
      }
      else {
         // remove request
         this.props.models.assignment.removeUser(button_id, this.props.current_user.id)
         .then(() => {
            let course_assignments = { ... this.state.course_assignments};
            delete course_assignments[button_id];
            this.setState({ course_assignments: course_assignments });
         })
         .catch ((err) => { });
      }
   }
   // sets state to the list of all courses that user is enrolled or teaching in 
   getCourses() {
      let self = this; 
      return new Promise(function(resolve, reject) {
         self.props.models.course.getCoursesForUser()
            .then((result) => {
               let courses = [];
               for (let course of result) {
                  const course_role = self.props.models.course.getCoursePrivileges(course.course_role);
                  if (course_role.can_modify_course === true || course_role.can_grade_assignment === true || course_role.can_submit_assignment === true) {
                     courses.push(course);
                  }
               }
               self.setState({ courses: courses  });
               resolve(); 
            })
            .catch(err => { reject(); });
      });
   }

   // sets state to the user's course privileges for currently selected course 
   getCourseRole() {
      let self = this; 
      return new Promise(function(resolve, reject) {
         let current_class = self.state.courses.find(x => x.id === self.state.selected_course);
         let role_number = current_class.course_role; 
         const privileges = self.props.models.course.getCoursePrivileges(role_number);
         self.setState({current_course_roles: privileges});
         resolve(); 
      }); 
   }

   updateSelectedCourse(evt) {
      this.setState({ selected_course: this.state.courses[evt.target.selectedIndex].id }, () => {
         this.getCourseRole()
         .then(() => this.getAssignmentsForCourse()); 
      });
      this.props.history.push(`/course/${evt.target.value}/assignments`);
   }

   formatCourseName(course) {
      return course.name + " - " + course.term + " " + course.year;
   }

   lockAssignment(evt) {
      const index = Number(evt.target.dataset.id);
      const assignment = this.state.course_assignments[index];
      this.props.models.assignment.lockAssignment(assignment.id);
      this.getAssignmentsForCourse();
   }

   viewAssignment(evt) {
      const index = Number(evt.target.dataset.id);
      const assignment = this.state.course_assignments[index];
      this.setState({selected_assignment: assignment.id});
   }

   getAssignmentsForCourse() {
      var state = this.state;
      var props = this.props;
      props.models.course.getActiveAssignmentsForCourse(state.selected_course)
         .then((result) => {
            let assignments_list = [];
            for (let assignment of result) {
               const course_role = state.current_course_roles; 
               if (course_role.can_modify_course === true || course_role.can_grade_assignment === true || course_role.can_submit_assignment === true) {
                  assignments_list.push(assignment);
               }
            }
            this.setState({ course_assignments: assignments_list });
         })
         .catch(err => {console.log(err); });
   }

   render() {
      const self = this;
      const headers = ['Assignment', 'Locked'];
      const assignment_headers = ['name', 'is_locked'];
      const assignment_buttons = [{ text: "View", click: this.viewAssignment }];
      const can_lock_assignment = self.props.current_user.is_admin || self.props.current_user.is_instructor;
      const course_assignments = this.state.course_assignments;
      const selected_assignment = this.state.selected_assignment;
      if(self.state.current_course_roles.can_modify_course === true && can_lock_assignment)
      {
         assignment_buttons.push({ text: "Lock/Unlock", click: this.lockAssignment });
      }
      if (self.state.selected_assignment !== -1)
      {
         return(<Redirect to= {"/assignment/" + self.state.selected_assignment} />);
      }
      
      const toggleCreate = () => {
         create = !create;
         this.getAssignmentsForCourse(this.props.current_user.id);
      }

      return (
         <article className="container">
            <select value={this.state.selected_course} onChange={this.updateSelectedCourse}>
               {this.state.courses.map((value, index) =>
                  <option
                     key={index}
                     value={value.course_id}>
                     {this.formatCourseName(value)}
                     {this.updateSelectedCourse}
                  </option>
               )}
            </select>
            
            <article>
               <h1>Assignments</h1>
               <table className="table table-striped text-left">
                  <thead>
                     <tr>
                        <th scope="col">
                           {
                              ((this.props.current_user.is_instructor ===1)
                              || (this.props.current_user.is_admin === 1))
                              && <button
                              className={(create) ? "btn btn-danger": "btn btn-success"}
                              onClick={toggleCreate}
                              id="createNewCourseButton"
                              >
                              {(create) ? "X" : "+"}
                              </button>
                           }
                        </th>
                        <th scope="col">Assignment</th>
                        <th scope="col">Locked</th>
                     </tr>
                  </thead>

                  <tbody>
                     {course_assignments.reduce((result,assignment) => {
                        if(selected_assignment[assignment.id] !== undefined){
                           result.push(assignment);
                        }
                        return result;
                     }, []).map((value, index) => {
                        return (
                           <tr key={value.id}>
                              <td>
                                 <button className="btn btn-primary" data-id={value.id} onClick={self.assignmentButtonClick}></button>
                              </td>
                           </tr>
                        );
                     })}     
                  {create && <AssignmentTemplate 
                        handleSubmission={self.addAssignmentAsync}
                        props={self}
                        />}
                  </tbody>
               </table>

               <UserList header={headers} raw_data={this.state.course_assignments} data_cols={assignment_headers} buttons={assignment_buttons} />
            </article>
         </article>
      );
   }
}

// Assignment template to be filled out by creator
const AssignmentTemplate = ({handleSubmission, props}) => {
   const [courseID, setCourseID] = React.useState("");
   const [assignmentName, setAssignmentName] = React.useState("");
   const [assignmentDescription, setDescription] = React.useState("");
   const [isLocked, setIsLocked] = React.useState("0");

   return (
      <tr>
         <td>
            <button
            id="submitNewAssignmentButton"
            className="btn btn-primary"
            onClick={() => handleSubmission({
               course_id: courseID,
               name:assignmentName,
               description: assignmentDescription,
               is_locked:isLocked
            }, props)}
            >Submit</button>
         </td>
         <td>
            <input
               placeholder="Assignment"
               onChange={e => setAssignmentName(e.target.value)}
            ></input>
         </td>
         <td>
            <select
            onChange={e => setIsLocked(e.target.value)}>
               <option value="0">0</option>
               <option value="1">1</option>
            </select>
         </td>
      </tr>
      
   )
}

const AssignmentsList = connect(mapStateToProps)(AssignmentsListView);
export { AssignmentsList };
export default AssignmentsList;