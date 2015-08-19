import SideMenu from './SideMenu';
import MainNavbar from './MainNavbar';
import SecondNavbar from './SecondNavbar';

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
          <SecondNavbar />
          <div className="synthesis__container container-fluid">
            <div className="row">
              <div className="scrollable-col left col-xs-12  col-sm-4  col-md-3  block--mobile">
                <SideMenu synthesis={this.props.synthesis} />
              </div>
              <div className="scrollable-col right col-xs-12  col-sm-8  col-md-9">
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
