import React, { useEffect, useState, Component } from 'react';
//import { connect } from "react-redux";
//import {selectUser} from '../../actions/index';
import './index.css';
//import { ViewUsers } from './ViewUsers';
//import { FetchUsers } from './FetchUsers';


function FetchUsers() {
   return fetch('http://localhost:8080/api/users')
     .then(data => data.json())
 }

  const AdminView = () => {
   
   const [users, setUser] = useState([]);

   useEffect(()=>{
      let mounted = true;
      FetchUsers()
         .then(user => {
            if(mounted) {
               setUser(user)
            }
         })
      return () => mounted = false;
   }, [])

      return(
         <div className="wrapper">
            <h1>Test Users</h1>
            <ul>
               {users.map(user => <li key={user.user}>{user.user}</li>)}
            </ul>
         </div>
         //<ViewUsers/>
      )
  }
  
  //const Admin = connect(mapStateToProps, mapDispatchToProps)(AdminView);
  //export { Admin };
  export default AdminView;

//  {users.map(users=>(
//   <li key={users.id}>{users.name}</li>
//))}