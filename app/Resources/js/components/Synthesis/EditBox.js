import SideMenu from './SideMenu';

const RouteHandler = ReactRouter.RouteHandler;

const EditBox = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.synthesis.editable) {
      return (
        <div className="synthesis--edit row">

          <div className="col-xs-12  col-sm-4  col-md-3  block--mobile" id="render-synthesis-menu">
            <SideMenu synthesis={this.props.synthesis} />
          </div>

          <div className="col-xs-12  col-sm-8  col-md-9" id="render-synthesis-content">
            <RouteHandler synthesis={this.props.synthesis} />
          </div>

        </div>
      );
    }
  },

});

export default EditBox;
