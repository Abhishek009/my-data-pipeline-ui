import axios, { AxiosResponse, AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';
import { Login } from './DataModel.tsx'

const client = axios.create({
    baseURL: 'http://localhost:8080/api',
  });

const config: AxiosRequestConfig = {
    headers: {
      'Accept': 'application/json',
    } as RawAxiosRequestHeaders,
  };

export const loginUser = async(email,password)  => {
  
try{
    const data = {
        "email": email,
        "password": password,
    };
 console.log("==========",data)
 const response = await client.post("/login",data,config)
 console.log("==========",response.data)
 return response.data;
}catch(error) {
    console.error("Error logging user:",error)
    throw error;
}
}

export const getConnection = async()  => {
  
try{
    

 const response = await client.get("/connections")
 console.log("==========",response.data)
 return response.data;
}catch(error) {
    console.error("Error logging user:",error)
    throw error;
}
}