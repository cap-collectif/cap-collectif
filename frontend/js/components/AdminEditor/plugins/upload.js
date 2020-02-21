// @flow
import Fetcher, { json } from '../../../services/Fetcher';

/**
 * Step2. save to server
 */
const saveToServer = (
  file: File,
  onSuccess: string => void,
  onError: (string | Object) => void,
) => {
  const formData = new FormData();
  formData.append('file', file);
  Fetcher.postFormData('/files', formData)
    .then(json)
    .then(
      res => {
        onSuccess(res.url);
      },
      err => {
        onError(err);
      },
    );
};

/**
 * Step1. select local image
 */
export const uploadLocalImagePlugin = (
  onSuccess: string => void,
  onError: (string | Object) => void,
) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.click();

  // Listen upload local image and save to server
  input.onchange = () => {
    const file = input.files[0];

    // file type is only image.
    if (/^image\//.test(file.type)) {
      saveToServer(file, onSuccess, onError);
    } else {
      onError('You could only upload images');
    }
  };
};

export const attachFilePlugin = (onSuccess: string => void, onError: (string | Object) => void) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', '.pdf'); // TODO : see the files we want to accept
  input.click();

  // Listen upload local image and save to server
  input.onchange = () => {
    const file = input.files[0];

    // file type is only pdf.
    if (file.type) {
      saveToServer(file, onSuccess, onError);
    } else {
      onError('You could only upload pdf');
    }
  };
};
