const CkeditorMixin = {

  initializeCkeditor(name) {
    CKEDITOR.basePath = '/js/ckeditor/';
    const ckeditorConfig = {
      removePlugins: 'elementspath',
      toolbar: [
        ['Undo', 'Redo'],
        ['Format'],
        ['Bold', 'Italic', 'Underline', 'Strike'],
        ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote'],
        ['Link', 'Unlink'],
        ['Image', 'Table', 'HorizontalRule'],
        ['Maximize'],
      ],
      language: 'fr',
      skin: 'bootstrapck',
      extraPlugins: 'autolink,autogrow',
      extraAllowedContent: 'a[!href,_src,target,class]; br',
      autoParagraph: false,
      enterMode: CKEDITOR.ENTER_P,
      shiftEnterMode: CKEDITOR.ENTER_BR,
    };

    const editor = CKEDITOR.replace(React.findDOMNode(this.refs[name]).querySelector('textarea'), ckeditorConfig);

    editor.on('instanceReady', (evt) => {
      const blockTags = ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'li', 'blockquote', 'ul', 'ol',
        'table', 'thead', 'tbody', 'tfoot', 'td', 'th'];
      for (let i = 0; i < blockTags.length; i++) {
        evt.editor.dataProcessor.writer.setRules(blockTags[i],
          {
            indent: false,
            breakBeforeOpen: false,
            breakAfterOpen: false,
            breakBeforeClose: false,
            breakAfterClose: true,
          }
        );
      }
    });


    editor.on('change', (evt) => {
      const diff = {};
      diff[name] = evt.editor.getData();
      this.setState(diff);
    });
  },

};

export default CkeditorMixin;
