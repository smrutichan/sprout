import axios from "axios";

const API = axios.create({
  baseURL: "https://vertebrae-riveter-handrail.ngrok-free.dev",
});

export default API;