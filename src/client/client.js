import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL

const fetchGetData = (uri) => {
      const url = `${BASE_URL}${uri}`;
    return axios.get(url)
    .catch(error => {

        console.error('Error fetching data for url:', url, 'error', error.message);
        throw error;
});

};

const fetchPostData = (uri, payload) => {
    const url = `${BASE_URL}${uri}`;
    return axios.post(url, payload)
    .catch(error => {
        console.error('Error posting data to url:', url, 'error', error.message);
        throw error;
    });
 
};

const fetchPostDataWithAuth = (uri, payload) => {

  const token = localStorage.getItem('token');

  const url = `${BASE_URL}${uri}`;
  return axios.post(url, payload, {headers: {
    "accept": "*/*",
    "Content-Type": "application/json",
     "Authorization": `Bearer ${token}`,
  },
})
    .catch(error => {
      // Handle exceptions/errors
      console.error('Error fetching data for URL:', url, 'Error', error.message);
      // You can throw the error again if you want to handle it elsewhere
      throw error;
    });

}; 

export const fetchGetDataWithAuth = async (uri) => {
  const token = localStorage.getItem('token');
  const url = `${BASE_URL}${uri}`;

  if (!token) {
    throw new Error('No auth token found. Please login again.');
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data for URL:', url, error.message);
    throw error;
  }
};

export const fetchUploadWithAuth = async (uri, files) => {
  const token = localStorage.getItem('token');
  const url = `${BASE_URL}${uri}`;

  if (!token) throw new Error('No auth token found. Please login again.');

  const formData = new FormData();
  files.forEach((file) => formData.append('files', file)); // key must match @RequestPart MultipartFile[] files

  try {
    const res = await axios.post(url, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error uploading photos to URL:', url, error.message);
    throw error;
  }
};




export default fetchGetData;
export { fetchPostData, fetchPostDataWithAuth };