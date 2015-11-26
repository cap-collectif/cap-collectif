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

  handleFilterChange(filter) {
    const value = this.refs[filter].getValue();
    ProposalActions.changeFilterValue(filter, value);
    this.reload();
  },

  reload() {
    ProposalActions.load(this.props.fetchFrom, this.props.id);
  },

  buttons: ['last', 'old', 'comments'],
  filters: ['theme', 'status', 'type', 'district'],

  render() {
    console.log(this.filters);
    return (
    <div>
      <ButtonToolbar>
        <ButtonGroup>
          {
            this.buttons.map((button) => {
              return (
                <Button active={this.state.order === button} onClick={this.handleOrderChange.bind(this, button)}>
                  {this.getIntlMessage('global.filter_' + button)}
                </Button>
              );
            })
          }
        </ButtonGroup>
        <ProposalListSearch value={'search terms'} />
      </ButtonToolbar>
      <Row>
        {
          this.filters.map((filter, value) => {
            return (
              <Col xs={12} md={6}>
                <Input
                  type="select"
                  ref={filter}
                  onChange={this.handleFilterChange.bind(this, filter)}
                  value={value}
                >
                  <option value="">
                    {this.getIntlMessage('global.select_' + filter)}
                  </option>
                  {
                    this.props[filter].map((option) => {
                      return (
                        <option key={option.id} value={option.id}>
                          {option.title || option.name}
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
