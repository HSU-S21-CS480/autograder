import React, { Component, useState, useEffect } from 'react';
//import {Link, RouteComponentProps } from 'react-router-dom';
import './index.css';

class ViewUsers extends Component {

    constructor(props) {
        super(props)

        this.state = {
            users: []
        }
    }

    componentDidMount() { //broken here -- returns 500 on console
        return fetch('http://localhost:8080/api/user')
            .then(data => data.json())
      }

    render() {
        return ( 
            <div className="userlist">
                <span className="userlistname">Users</span>
                <table>
                    <thead>
                    <tr>
                     <th>Id</th>
                     <th>Name</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.users.map(users =>
                     <tr key={this.users.id}>
                         <td>{this.users.name} </td>
                     </tr>
                    )}
                    </tbody>
                </table>
            </div> 
        );
    }
}

export { ViewUsers };
export default ViewUsers;