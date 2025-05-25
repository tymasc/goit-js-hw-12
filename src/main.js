import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

let query = '';
let page = 1;
let totalHits = 0;

const form = document.querySelector('#form-info');
const loadMoreBtn = document.querySelector('.load-more');

form.addEventListener('submit', async e => {
  e.preventDefault();
  query = e.target.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.warning({ message: 'Please enter a search term!' });
    return;
  }

  page = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();
    await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({ message: 'No images found. Try another search.' });
      return;
    }

    createGallery(data.hits);
    if (data.totalHits > 15) showLoadMoreButton();
    if (data.totalHits <= 15) hideLoadMoreButton();
  } catch (error) {
    iziToast.error({ message: 'An error occurred. Try again later.' });
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener('click', async () => {
    page += 1;
    loadMoreBtn.classList.toggle('hidden');
    showLoader();
    await new Promise(resolve => setTimeout(resolve, 1000));
    loadMoreBtn.classList.toggle('hidden');

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);

    scrollPage();

    const shownImages = document.querySelectorAll('.gallery-item').length;
    if (shownImages >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        message: `We're sorry, but you've reached the end of search results.`,
      });
    }
  } catch (error) {
    iziToast.error({ message: 'Failed to load more images.' });
  } finally {
    hideLoader();
  }
});

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery a')
    .getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
