import axios from 'axios'

export const getToken= async()=>{
     try {
    const result = await axios.get("/api/getToken");
    return result.data.token;
  } catch (err) {
    console.error("Failed to fetch token:", err.response?.data || err.message);
    throw err;
  }
}