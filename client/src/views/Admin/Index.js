import React, { useEffect, useState, Component } from 'react';
//import { connect } from "react-redux";
//import {selectUser} from '../../actions/index';
import './index.css';
import { ViewUsers } from './ViewUsers';

  const AdminView = () => {
   
   //const [user, setUser] = useState([])

   //useEffect(()=>{

   //}, [])

      return(
         <ViewUsers/>
      );
  }
  
  //const Admin = connect(mapStateToProps, mapDispatchToProps)(AdminView);
  //export { Admin };
  export default AdminView;

//  {users.map(users=>(
//   <li key={users.id}>{users.name}</li>
//))}