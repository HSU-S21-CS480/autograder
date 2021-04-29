import { UPDATE_USER, UPDATE_COURSE_USER, SELECT_USER } from "./constants";

export function updateUser(payload) {
  return { type: UPDATE_USER, payload };
}
export function updateCourseUser(payload) {
   return { type: UPDATE_COURSE_USER, payload };
 }

export function selectUser(payload) {
  return { type: SELECT_USER, payload };
}