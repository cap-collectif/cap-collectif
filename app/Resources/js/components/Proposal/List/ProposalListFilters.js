import ProposalActions from '../../../actions/ProposalActions';
import ProposalStore from '../../../stores/ProposalStore';
import ProposalListSearch from '../List/ProposalListSearch';
import Input from '../../Form/Input';


const Button = ReactBootstrap.Button;
const ButtonGroup = ReactBootstrap.ButtonGroup;
const ButtonToolbar = ReactBootstrap.ButtonToolbar;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const ProposalListFilters = React.createClass({
  propTypes: {
    id: React.PropTypes.number.isRequired,
    fetchFrom: React.PropTypes.string,
    onChange: React.PropTypes.func.isRequired,
    theme: React.PropTypes.array.isRequired,
    type: React.PropTypes.array.isRequired,
    district: React.PropTypes.array.isRequired,
    status: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      fetchFrom: 'form',
    };
  },

  getInitialState() {
    return {
      order: ProposalStore.order,
      filters: ProposalStore.filters,
      isLoading: true,
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState && (prevState.order !== this.state.order || prevState.filters !== this.state.filters)) {
      this.reload();
      this.props.onChange();
    }
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      order: ProposalStore.order,
      filters: ProposalStore.filters,
    });
  },

  handleOrderChange(order) {
    ProposalActions.changeOrder(order);
  },

  handleFilterChange(filterName) {
    const value = this.refs[filterName].getValue();
    ProposalActions.changeFilterValue(filterName, value);
    this.reload();
  },

  reload() {
    ProposalActions.load(this.props.fetchFrom, this.props.id);
  },

  buttons: ['last', 'old', 'comments'],
  filters: ['theme', 'status', 'type', 'district'],

  render() {
    return (
    <div>
      <Row>
        <Col xs={12} md={6}>
          <ButtonToolbar>
            <ButtonGroup id="proposal-sorting">
              {
                this.buttons.map((button, index) => {
                  return (
                    <Button
                      id={'proposal-sorting-' + button}
                      key={index}
                      active={this.state.order === button}
                      onClick={this.handleOrderChange.bind(this, button)}
                    >
                      {this.getIntlMessage('global.filter_f_' + button)}
                    </Button>
                  );
                })
              }
            </ButtonGroup>
          </ButtonToolbar>
        </Col>
        <Col xs={12} md={6}>
          <ProposalListSearch fetchFrom={this.props.fetchFrom} id={this.props.id} />
        </Col>
      </Row>
      <Row>
        {
          this.filters.map((filterName, index) => {
            return (
              <Col xs={12} md={6} key={index}>
                <Input
                  type="select"
                  id={'proposal-filter-' + filterName}
                  ref={filterName}
                  onChange={this.handleFilterChange.bind(this, filterName)}
                  value={this.state.filters[filterName] || 0}
                >
                  <option value="0">
                    {this.getIntlMessage('global.select_' + filterName)}
                  </option>
                  {
                    this.props[filterName].map((choice) => {
                      return (
                        <option key={choice.id} value={choice.id}>
                          {choice.title || choice.name}
                        </option>
                      );
                    })
                  }
                </Input>
              </Col>
            );
          })
        }
      </Row>
    </div>
    );
  },

});

export default ProposalListFilters;
