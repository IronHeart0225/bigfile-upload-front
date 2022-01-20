import axios from "axios";
const axiosInstance = axios.create({
  baseURL: "http://localhost:16273/",
});
export default axiosInstance;
