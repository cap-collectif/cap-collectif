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
      extraAllowedContent: 'a[!href,_src,target,class]',
    };

    const editor = CKEDITOR.replace(React.findDOMNode(this.refs[name]).querySelector('textarea'), ckeditorConfig);

    editor.on('change', (evt) => {
      const diff = {};
      diff[name] = evt.editor.getData();
      this.setState(diff);
    });
  },

};

export default CkeditorMixin;
