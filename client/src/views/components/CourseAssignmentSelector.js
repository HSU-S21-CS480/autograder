import React, { Component } from 'react';
import { connect } from "react-redux";
import { updateCourseUser } from '../../actions/index';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

const mapDispatchToProps = dispatch => {
   return {
      updateCourseUser: user => dispatch(updateCourseUser(user))
   };
};

class CourseAssignmentSelectorView extends Component {

   constructor(props) {
      super(props);
      this.state = {
         courses: [],
         assignments: [],
         selected_course: {},
         selected_assignment: {},
         initial_assignment: -1
      };

      this.getAssignmentsForCourse = this.getAssignmentsForCourse.bind(this);
      this.updateSelectedAssignment = this.updateSelectedAssignment.bind(this);
      this.updateSelectedCourse = this.updateSelectedCourse.bind(this);
      this.formatCourseName = this.formatCourseName.bind(this);
   }

   componentDidMount() {
      this.props.models.course.getCoursesForUser(this.props.current_user.id)
         .then((courses) => {
            this.setState({ courses: courses, selected_course: courses[0] }, () => {
               this.props.updateCourseUser(this.state.selected_course);
               this.getAssignmentsForCourse();
            });
         })
         .catch((err) => { });

      this.setState({initial_assignment: this.props.initial_assignment})
   }

   getAssignmentsForCourse() {
      this.props.models.course.getActiveAssignmentsForCourse(this.state.selected_course.course_id)
         .then((assignments) => {
            let select = 0;

            if (this.state.initial_assignment > -1) {
               for (let i=0; i<assignments.length; i++) {
                  if (parseInt(assignments[i].id) === parseInt(this.state.initial_assignment)) {
                     select = i;
                     break;
                  }
               }
            }

            this.setState({ assignments: assignments, selected_assignment: assignments[select] }, () => {
               this.props.onAssignmentChange(this.state.selected_assignment);
            });
         })
         .catch((err) => { });
   }

   updateSelectedCourse(evt) {
      this.setState({ selected_course: this.state.courses[evt.target.selectedIndex] }, () => {
         this.props.updateCourseUser(this.state.selected_course);
         this.getAssignmentsForCourse();
      });
   }

   updateSelectedAssignment(evt) {
      this.setState({ 
         selected_assignment: this.state.assignments[evt.target.selectedIndex],
         initial_assignment: -1
      }, () => {
         this.props.onAssignmentChange(this.state.selected_assignment);
      });
   }

   formatCourseName(course) {
      return course.name + " - " + course.term + " " + course.year;
   }

   render() {
      const class_name = this.props.class_name;
      return (
         <React.Fragment>
               <div className={class_name}>
                  Course:
                  <select onChange={this.updateSelectedCourse}>
                     {this.state.courses.map((value, index) =>
                        <option
                           key={index}
                           value={value.course_id}>
                           {this.formatCourseName(value)}
                        </option>
                     )}
                  </select>
               </div>
               <div className={class_name}>
                  Assignment: 
                  <select 
                     value={(this.props.initial_assignment > -1) ? this.props.initial_assignment : this.state.selected_assignment.id} 
                     onChange={this.updateSelectedAssignment}>
                     {this.state.assignments.map((value, index) =>
                        <option
                           key={index}
                           value={value.id}>
                           {value.name}
                        </option>
                     )}
                  </select>
               </div>
        </React.Fragment>
      );
   }
}

const CourseAssignmentSelector = connect(mapStateToProps, mapDispatchToProps)(CourseAssignmentSelectorView);
export { CourseAssignmentSelector };
export default CourseAssignmentSelector;