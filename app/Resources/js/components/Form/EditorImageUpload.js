// @flow
import Fetcher, { json } from '../../services/Fetcher';

/**
 * Step3. insert image url to rich editor.
 */
const insertToEditor = (url: string, quill: Object) => {
  // push image url to rich editor.
  const range = quill.getSelection();
  quill.insertEmbed(range.index, 'image', url);
};

/**
 * Step2. save to server
 */
const saveToServer = (file: File, quill: Object) => {
  const formData = new FormData();
  formData.append('file', file);
  Fetcher.postFormData('/files', formData)
    .then(json)
    .then(res => {
      insertToEditor(res.url, quill);
    });
};

/**
 * Step1. select local image
 */
export const selectLocalImage = (quill: Object) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.click();

  // Listen upload local image and save to server
  input.onchange = () => {
    const file = input.files[0];

    // file type is only image.
    if (/^image\//.test(file.type)) {
      saveToServer(file, quill);
    } else {
      throw new Error('You could only upload images');
    }
  };
};
