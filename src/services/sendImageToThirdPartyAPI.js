import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

export const sendImageToThirdPartyAPI = async (filePath) => {
  try {
    const formData = new FormData();
    formData.append('files', fs.createReadStream(filePath));

    const response = await fetch(process.env.API_URL_AI, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to send image to third-party API. Status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending image to third-party API:', error.message);
    throw new Error(error.message);
  }
};
