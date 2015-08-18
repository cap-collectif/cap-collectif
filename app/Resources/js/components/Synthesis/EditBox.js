import SideMenu from './SideMenu';
import MainNavbar from './MainNavbar';

const RouteHandler = ReactRouter.RouteHandler;

const EditBox = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.synthesis.editable) {
      return (
        <div className="synthesis__tool">
          <MainNavbar />
          <div className="synthesis__container container-fluid">
            <div className="row">
              <div className="col-xs-12  col-sm-4  col-md-3  block--mobile">
                <SideMenu synthesis={this.props.synthesis} />
              </div>
              <div className="col-xs-12  col-sm-8  col-md-9">
                <RouteHandler synthesis={this.props.synthesis} />
              </div>
            </div>
          </div>
        </div>
      );
    }
  },

});

export default EditBox;
