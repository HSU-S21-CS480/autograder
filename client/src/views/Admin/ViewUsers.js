import React, { Component, useState, useEffect } from 'react';
import {Link, RouteComponentProps } from 'react-router-dom';
import './index.css';
const axios = require('axios'); 

class ViewUsers extends Component {

    constructor(props) {
        super(props)

        this.state = {
            users: []
        }
    }

    componentDidMount() { //broken here -- returns 404 on console
        //not sure how to fix this 
        axios
          .get(`/users`)
          .then(res => this.setState({ users: res.data }))
          .catch(err => console.log(err))
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