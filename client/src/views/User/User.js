import React, { Component } from 'react';
import { connect } from "react-redux";
import {selectUser} from '../../actions/index';

const mapStateToProps = state => {
    return { current_user: state.current_user, models: state.models };
  };
 
  const mapDispatchToProps = dispatch => {
    return {
       selectUser: user => dispatch(selectUser(user))
     };
  };

class UserView extends Component {

  constructor(props) {
        super(props);

        this.state = {
           has_courses: false, 
           valid_login: false, 
           redirect_path: "https://github.com/login/oauth/authorize?client_id=" + oauthconfig.client_id + "&redirect_uri=http://localhost:8080/api/user/oauth/"
        };
     }

   componentDidMount(){
      this.props.models.user.currentUser()
         .then((user) => {
            if (user.id !== undefined && user.id > 0)
            {
               this.props.updateUser(user); 
            }
            else
            {
               this.setState({valid_login: false});
               return Promise.reject('no user logged in'); 
            }
         })
         .then(() => this.props.models.course.getCoursesForUser(this.props.current_user.id))
         .then((courses) => {
            if (courses && courses.length)
            {
               // user is enrolled in courses 
               this.setState({has_courses: true}); 
            }
            else
            {
               this.setState({has_courses: false}); 
            }
         })
         .then(() => {
            // done updating state, ready for login 
            this.setState({valid_login: true}); 
         })
         .catch(() => {
            this.setState({valid_login: false}); 
         });
   }

   //Test Render HTML
   render() {
      return (
         <div>
         
         <nav className="navbar navbar-expand-lg fixed-top navbar-light bg-light">
            <Link to="/" className="navbar-brand">Assisted Grader</Link>
            <button
               className="navbar-toggler"
               type="button"
               data-toggle="collapse"
               data-target="#navbarNav"
               aria-controls="navbarSupportedContent"
               aria-expanded="false"
               aria-label="Toggle navigation"
            >
               <span className="navbar-toggler-icon"></span>
            </button>
         </nav>
      </div> 
      );
   }
}
  
  const User = connect(mapStateToProps, mapDispatchToProps)(UserView);
  export { User };
  export default User;