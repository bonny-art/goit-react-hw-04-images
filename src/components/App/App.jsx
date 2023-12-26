import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

import * as ImageService from 'services/image-service';

import {
  Searchbar,
  ImageGallery,
  Button,
  Modal,
  Loader,
  ErrorMessage,
} from 'components';
import { AppStyled, BigImageStyled } from './App.styled';

export const App = () => {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [err, setErr] = useState(null);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState('');
  const [status, setStatus] = useState(null);

  useEffect(() => {
    page > 1 &&
      // setTimeout(() => {
      scrollDown();
    // }, 500);
  }, [page]);

  useEffect(() => {
    const getImages = async () => {
      try {
        const { hits, totalHits } = await ImageService.getImages(query, page);

        hits.map(hit => (hit.id = nanoid()));

        setImages(i => [...i, ...hits]);
        setIsButtonVisible(page < Math.ceil(totalHits / ImageService.PER_PAGE));
        setStatus(totalHits === 0 ? 'rejected' : 'resolved');
        setErr(
          totalHits === 0 ? `There is no images on query: ${query}` : null
        );
      } catch (error) {
        setErr(error);
        setStatus(error);
      }
    };

    query && getImages();
  }, [query, page]);

  const handleSearch = query => {
    setQuery(query);
    setImages([]);
    setPage(1);
    setErr(null);
    setStatus('pending');
  };

  const scrollDown = () => {
    window.scroll({
      top: window.scrollY + (window.innerHeight - (72 + 40 + 24 + 16)) + 2,
      behavior: 'smooth',
    });
  };

  const loadNextPage = () => {
    setPage(p => p + 1);
  };

  const showBigImage = id => {
    setSelectedImageId(id);
    toggleModal();
  };

  const toggleModal = () => {
    setSelectedImageId(s => (showModal ? '' : s));
    setShowModal(s => !s);
  };

  const selectedImage = images.find(image => image.id === selectedImageId);

  return (
    <>
      <AppStyled>
        <Searchbar onSubmit={handleSearch} />

        {status === 'pending' && <Loader />}

        {status === 'rejected' && <ErrorMessage message={err} />}

        {status === 'resolved' && (
          <>
            <ImageGallery imageList={images} showBigImage={showBigImage} />
            {isButtonVisible && <Button onClick={loadNextPage} />}
          </>
        )}
      </AppStyled>

      {showModal && selectedImageId && (
        <Modal onClose={toggleModal}>
          <BigImageStyled
            src={selectedImage.largeImageURL}
            alt={selectedImage.tags}
          />
        </Modal>
      )}
    </>
  );
};
