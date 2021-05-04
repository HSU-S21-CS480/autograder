import Admin from './Index'

const routes = [
   {
      path: "/admin",
      component: Admin,
      strict_match: true
   }
];

export default routes;
export {routes};