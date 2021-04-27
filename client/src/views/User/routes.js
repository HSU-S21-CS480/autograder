import User from './User'

const routes = [
   {
      path: "/user",
      component: User,
      strict_match: true
   }
];

export default routes;
export {routes};