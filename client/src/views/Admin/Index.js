import React, { useEffect, useState, Component } from 'react';
import axios from 'axios';
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
   
   const [users, setPosts] = useState([])

   const getPosts = async () => {
      try {const userPosts = await axios.get("https://localhost:8080")
        
        setPosts(userPosts.data);
      
      } catch (err) {
        console.error(err.message);
      }
    };
    
    useEffect(()=>{
        
        getPosts()
      }, [])

      return(
         <div>
            <h1>useEffect</h1>
            <ul>
               {users.map(users=>(
                  <li key={users.id}>{users.name}</li>
               ))}   
            </ul>  
         </div>
      );
  }
  
  const Admin = connect(mapStateToProps, mapDispatchToProps)(AdminView);
  export { Admin };
  export default Admin;