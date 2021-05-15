import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from "react-redux";

const mapStateToProps = state => {
   return { current_user: state.current_user };
};

class HeaderView extends Component {

   constructor(props) {
      super(props);
      this.AccountLinks = this.AccountLinks.bind(this);
   }

   AccountLinks() {

      let links = [];
      if (this.props.current_user.is_admin === 1) {
         links.push(<Link to="/admin" className="dropdown-item">Admin</Link>);
      }
      if (this.props.current_user.id > 0) {
         links.push(<Link to="/course" className="dropdown-item">My Courses</Link>);
         links.push(<Link to="/account/logout" className="dropdown-item">Logout</Link>);
      }
      else {
         links.push(<Link to="/account/login" className="dropdown-item">Login</Link>);
         links.push(<Link to="/account/create" className="dropdown-item">Create</Link>);
      }
      return (
         <div>
            {links.map((link, index) => (
               <span key={index}>{link}</span>
            ))}
         </div>
      );
   }

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
               <div className="collapse navbar-collapse" id="navbarNav">
                  <ul className="navbar-nav ml-auto">
                     <li className="nav-item">
                        <Link to="/" className="nav-link">Home</Link>
                     </li>
                     <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle"
                           href="#top" id="navbarDropdown"
                           role="button"
                           data-toggle="dropdown"
                           aria-haspopup="true"
                           aria-expanded="false">
                           Account
                           </a>
                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                           <this.AccountLinks />
                        </div>
                     </li>
                  </ul>
               </div>
            </nav>
         </div>
      );
   }
}

const Header = connect(mapStateToProps)(HeaderView);
export { Header };
export default Header;