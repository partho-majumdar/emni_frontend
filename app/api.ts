const baseURL = "http://localhost:3000";
export const getSignInApi = function (student: boolean) {
  if (student) {
    return `${baseURL}/api/student/login`;
  } else {
    return `${baseURL}/api/mentor/login`;
  }
};
