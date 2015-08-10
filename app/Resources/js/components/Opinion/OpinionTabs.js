import OpinionVersionList from './OpinionVersionList';
import OpinionVersionForm from './OpinionVersionForm';
import OpinionBox from './OpinionBox';
import OpinionArgumentForm from './OpinionArgumentForm';
import OpinionSourceForm from './OpinionSourceForm';
import OpinionSourceList from './OpinionSourceList';
import OpinionArgumentList from './OpinionArgumentList';
import OpinionActions from '../../actions/OpinionActions';
import Fetcher from '../../services/Fetcher';

const TabbedArea = ReactBootstrap.TabbedArea;
const TabPane = ReactBootstrap.TabPane;

const OpinionTabs = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      categories: [],
    }
  },

  componentDidMount() {

  },

  render() {
    return (
      <TabbedArea defaultActiveKey={1} animation={false}>
        <TabPane eventKey={1} tab={this.props.opinion.arguments_count + ' Arguments'}>
          <div className="row">
            <div className="col-sm-12 col-md-6">
               <div className="opinion  opinion--add-argument  block  block--bordered">
                  <OpinionArgumentForm type="yes" opinion={this.props.opinion} />
                </div>
                <OpinionArgumentList type="yes" opinion={this.props.opinion} />
            </div>
            <div className="col-sm-12 col-md-6">
              <div className="opinion  opinion--add-argument  block  block--bordered">
                <OpinionArgumentForm type="no" opinion={this.props.opinion} />
              </div>
              <OpinionArgumentList type="no" opinion={this.props.opinion} />
            </div>
          </div>
        </TabPane>
        <TabPane eventKey={2} tab={this.props.opinion.sources_count +' Sources'}>
          <div className="row">
            <OpinionSourceForm opinion={this.props.opinion} />
            <OpinionSourceList opinion={this.props.opinion} />
          </div>
        </TabPane>
      </TabbedArea>
      );
    },

});

export default OpinionTabs;
