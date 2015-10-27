import ProposalActions from '../../../actions/ProposalActions';

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
    localisation: React.PropTypes.array,
    theme: React.PropTypes.array,
    status: React.PropTypes.array,
    user_type: React.PropTypes.array,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      localisation: [{id: 1, label: 'ici'}, {id: 2, label: 'la bas'}],
      theme: [{id: 1, label: 'ici'}, {id: 2, label: 'la bas'}],
      status: [{id: 1, label: 'ici'}, {id: 2, label: 'la bas'}],
      user_type: [{id: 1, label: 'ici'}, {id: 2, label: 'la bas'}],
    };
  },

  getInitialState() {
    return {
      order: 'last',
      filters: {},
      isLoading: true,
      collapse: false,
    };
  },

  componentDidUpdate(prevProps, prevState) {
   if (prevState && prevState.order !== this.state.order || prevState.filters !== this.state.filters) {
     this.reload();
     this.props.onChange();
   }
  },

  handleOrderChange(order) {
    this.setState({order: order});
  },

  handleFilterChange(filter) {
    const value = this.refs[filter].getValue();
    this.setState({
      filters: React.addons.update(this.state.filters, {[filter]: {$set: value}})
    });
  },

  reload() {
    ProposalActions.load(this.props.id, this.state.order, this.state.filters);
  },

  buttons: ['last', 'old', 'popular', 'comments'],
  filters: ['localisation', 'theme', 'status', 'user_type'],

  render() {
    return (
    <div>
      <ButtonToolbar>
        <ButtonGroup>
          {
            this.buttons.map((button) => {
              return (
                <Button onClick={this.handleOrderChange.bind(this, button)}>
                  {this.getIntlMessage('global.filter_' + button)}
                </Button>
              );
            })
          }
        </ButtonGroup>
        <ButtonGroup>
          <Button onClick={()=> this.setState({collapse: !this.state.collapse})}>
            Filtres avancés
          </Button>
        </ButtonGroup>
      </ButtonToolbar>
      <Collapse in={this.state.collapse}>
        <Row>
          {
            this.filters.map((filter) => {

              return (
                <Input
                  type="select"
                  ref={filter}
                  onChange={this.handleFilterChange.bind(this, filter)}
                >
                  <option value="" disabled selected>
                    {this.getIntlMessage('global.select_' + filter)}
                  </option>
                  {
                    this.props[filter].map((type) => {
                      return (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      );
                    })
                  }
                </Input>
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
