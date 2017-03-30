import Expo from 'expo';

const ENDPOINT = 'http://devgorgias.azurewebsites.net/api/mobile/latest/moments/1000';

export default (async function getList({ size, page }) {

  // make sure the argument exists
  if (!size || !page) {
    console.error('Page size and page number are required');

    return false;
  }

  // GET the page listing
  return fetch(`${ENDPOINT}/${size}/${page}` , {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }).then((response) => {
    return response.json();
  }).catch((error) => {
    let err = new Error(error);
    throw err;
  });
});
