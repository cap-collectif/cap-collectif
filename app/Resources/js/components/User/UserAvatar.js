const svg = '<svg class="img-circle avatar media-object" version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="45px" height="45px" viewBox="0 0 200 200" enable-background="new 0 0 200 200" xml:space="preserve"><g><path fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round" stroke-miterlimit="10" d="M100,160.011h68.011c0,0,0-12.163-5.916-23.993c-4.41-8.819-22.024-14.039-45.683-22.908V95.367c0,0,7.239-6.661,7.239-18.49c2.959,0,5.916-11.826,0-14.785c0-1.754,7.927-16.569,5.916-26.613c-2.957-14.786-44.353-14.786-47.309-2.955c-17.742,0-5.915,27.169-5.915,29.568c-5.913,2.959-2.957,14.785,0,14.785c0,11.829,7.238,17.473,7.238,17.473v18.759c-23.655,8.875-41.273,14.089-45.682,22.908c-5.911,11.83-5.911,23.993-5.911,23.993H100z"/></g></svg>';

const UserAvatar = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    size: React.PropTypes.number,
    classes: React.PropTypes.string,
    style: React.PropTypes.object,
    anchor: React.PropTypes.bool,
  },

  getDefaultProps() {
    return {
      user: null,
      size: 45,
      classes: 'pull-left',
      style: {},
      anchor: true,
    };
  },

  renderAvatar() {
    const size = this.props.size + 'px';
    if (this.props.user && this.props.user.media) {
      return <img src={this.props.user.media.url} className="img-circle" style={{width: size, height: size}} />;
    }
    return <span dangerouslySetInnerHTML={{__html: svg }} />;
  },

  render() {
    if (this.props.user && this.props.user._links && this.props.anchor) {
      return (
        <a className={this.props.classes} style={this.props.style} href={this.props.user._links.profile}>
          { this.renderAvatar() }
        </a>
      );
    }

    return (
      <span className={this.props.classes} style={this.props.style} >
        { this.renderAvatar() }
      </span>
    );
  },

});

export default UserAvatar;
