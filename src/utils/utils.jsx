import axios from "axios";
export const apiDomain = "https://socialmedia.azurewebsites.net";

export const makeRequest = axios.create({
    baseURL: "https://socialmedia.azurewebsites.net/api/",
    withCredentials: true,
});