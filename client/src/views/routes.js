import { Route } from 'react-router-dom';
import React, { Component } from 'react';
import { routes as AccountRoutes } from './Account/routes';
import { routes as CourseRoutes } from './Course/routes';
import {routes as AssignmentRoutes } from './Assignment/routes';
import {routes as HomeRoutes } from './Home/routes';
import {routes as AdminRoutes } from './Admin/routes';

const routes = [].concat(AccountRoutes, CourseRoutes, AssignmentRoutes, HomeRoutes, AdminRoutes);

class RouteWithSubRoutes extends Component {

   render() {
      const route = this.props.route;
      if(route.strict_match === true)
      {
         return (
            <Route
               exact path={route.path}
               render={props => (
                  // pass the sub-routes down to keep nesting
                  <route.component {...props} routes={route.routes} />
               )}
            />
         )
      }
      else
      {
         return (
            <Route
               path={route.path}
               render={props => (
                  // pass the sub-routes down to keep nesting
                  <route.component {...props} routes={route.routes} />
               )}
            />
         )
      }
      
   }
}

export { routes as Routes, RouteWithSubRoutes };
export default routes;