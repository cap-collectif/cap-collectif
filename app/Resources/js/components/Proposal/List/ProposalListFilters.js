import ProposalActions from '../../../actions/ProposalActions';
import ProposalStore from '../../../stores/ProposalStore';

const Button = ReactBootstrap.Button;
const ButtonGroup = ReactBootstrap.ButtonGroup;
const ButtonToolbar = ReactBootstrap.ButtonToolbar;
const Collapse = ReactBootstrap.Collapse;
const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;
const Input = ReactBootstrap.Input;

const ProposalListFilters = React.createClass({
  propTypes: {
    id: React.PropTypes.number.isRequired,
    onChange: React.PropTypes.func.isRequired,
    theme: React.PropTypes.array.isRequired,
    type: React.PropTypes.array.isRequired,
    district: React.PropTypes.array.isRequired,
    status: React.PropTypes.array.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      order: ProposalStore.order,
      filters: ProposalStore.filters,
      isLoading: true,
      collapse: false,
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
    ProposalActions.load(this.props.id);
  },

  buttons: ['last', 'old', 'comments'],
  filters: ['theme', 'status', 'type', 'district'],

  render() {
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
        <ButtonGroup>
          <Button onClick={()=> this.setState({collapse: !this.state.collapse})}>
            { this.getIntlMessage('global.advanced_filters') }
          </Button>
        </ButtonGroup>
      </ButtonToolbar>
      <Collapse in={this.state.collapse}>
        <Row>
          <br />
          {
            this.filters.map((filter) => {
              return (
                <Col xs={12} md={6}>
                  <Input
                    type="select"
                    ref={filter}
                    onChange={this.handleFilterChange.bind(this, filter)}
                  >
                    <option value="" selected>
                      {this.getIntlMessage('global.select_' + filter)}
                    </option>
                    {
                      this.props[filter].map((type) => {
                        return (
                          <option key={type.id} value={type.id}>
                            {type.title || type.name}
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
      </Collapse>
    </div>
    );
  },

});

export default ProposalListFilters;
