//import React, { Component } from 'react';
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

  const AdminView = () => {
      return(
         <div>Potato</div>
      );
  }
  
  const Admin = connect(mapStateToProps, mapDispatchToProps)(AdminView);
  export { Admin };
  export default Admin;