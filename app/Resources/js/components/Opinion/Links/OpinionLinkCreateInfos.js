const OpinionLinkCreateInfos = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="modal-top bg-info">
        <p>
          { this.getIntlMessage('source.infos') }
        </p>
      </div>
    );
  },

});

export default OpinionLinkCreateInfos;
