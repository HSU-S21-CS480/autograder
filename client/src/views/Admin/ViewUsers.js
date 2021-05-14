import React, { Component, useState, useEffect } from 'react';
import {Link, RouteComponentProps } from 'react-router-dom';
import './index.css';



function ViewUser() {

    const [users, setUsers] = useState([])

        return ( 
            <div className="container">
                <table>
                    <thead>
                    <tr>
                     <th>Id</th>
                     <th>Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users && users.map(users =>
                     <tr key={this.users.id}>
                         <td>{this.users.name} </td>
                     </tr>
                    )}
                    </tbody>
                </table>
            </div> 
            
        );
}

class ViewUsers extends Component {

    render() {
        return(
        <section>
            <div className="userlist">
                <span className="userlistname">Users</span>
                <ViewUser/>
            </div>
        </section>
        )
    }


}

export { ViewUsers };
export default ViewUsers;