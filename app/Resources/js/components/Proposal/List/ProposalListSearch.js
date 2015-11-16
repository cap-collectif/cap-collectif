import ProposalActions from '../../../actions/ProposalActions';
import ProposalStore from '../../../stores/ProposalStore';
import Input from '../../Form/Input';

const Col = ReactBootstrap.Col;
const Button = ReactBootstrap.Button;

const ProposalListSearch = React.createClass({
    propTypes: {
        id: React.PropTypes.number.isRequired,
        onChange: React.PropTypes.func.isRequired,
    },
    mixins: [ReactIntl.IntlMixin],

    getInitialState() {
        return {
            id: 'proposal-search-input',
            value: '',
        };
    },

    handleChange() {
        this.setState({
            value: this.refs.input.getValue()
        });
    },

    innerSearchButton: <i className="cap cap-magnifier"></i>,

    render() {
        return (
            <Input
                type="text"
                ref="input"
                addonAfter={this.innerSearchButton}
                onChange={this.handleChange}
                groupClassName="proposal-search-input pull-right"
            >
            </Input>
        )
    }
});

export default ProposalListSearch;
