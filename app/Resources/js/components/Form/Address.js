// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import type { Connector } from 'react-redux';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';

type PassedProps = {
  onChange: Function,
  value: any,
  name: string,
  id: string,
  placeholder: string,
  formName: string,
  disabled: boolean,
};
type DefaultProps = { disabled: boolean };
type Props = PassedProps & DefaultProps & { updateAddressValue: Function };

const autocompleteItem = ({ formattedSuggestion }: { formattedSuggestion: Object }) => (
  <div>
    <i className="cap cap-map-location" /> <strong>{formattedSuggestion.mainText}</strong>{' '}
    <small>{formattedSuggestion.secondaryText}</small>
  </div>
);

class Address extends React.Component<Props> {
  static defaultProps = {
    disabled: false,
  };

  resetAddressField = () => {
    this.props.onChange(null);
    this.props.updateAddressValue(null);
  };

  handleAddressChange = address => {
    geocodeByAddress(address)
      .then(results => {
        const addressToSend = JSON.stringify(results);
        const addressText = results[0].formatted_address;
        this.props.onChange(addressText);
        this.props.updateAddressValue(addressToSend);
      })
      .catch(error => {
        this.resetAddressField();
        console.error('Google places error!', error); // eslint-disable-line
      });
  };

  render() {
    const { placeholder, value, id, onChange } = this.props;
    return (
      <PlacesAutocomplete
        inputProps={{
          onChange: address => {
            onChange(address);
          },
          placeholder,
          value,
          type: 'text',
          id,
        }}
        autocompleteItem={autocompleteItem}
        onEnterKeyDown={this.handleAddressChange}
        onSelect={this.handleAddressChange}
        onError={() => {
          this.resetAddressField();
        }}
        classNames={{
          // root: `${this.state.errors.address.length > 0 ? 'form-control-warning' : ''}`,
          input: 'form-control',
          autocompleteContainer: {
            zIndex: 9999,
            position: 'absolute',
            top: '100%',
            backgroundColor: 'white',
            border: '1px solid #555555',
            width: '100%',
          },
          autocompleteItem: {
            zIndex: 9999,
            backgroundColor: '#ffffff',
            padding: '10px',
            color: '#555555',
            cursor: 'pointer',
          },
          autocompleteItemActive: {
            zIndex: 9999,
            backgroundColor: '#fafafa',
          },
        }}
      />
      // {hasError && <div className="form-control-feedback">{error}</div>}
    );
  }
}

const mapDispatchToProps = (dispatch, props) => ({
  updateAddressValue: (value) => {
    dispatch(change(props.formName, 'address', value));
  },
});

const connector: Connector<PassedProps, Props> = connect(null, mapDispatchToProps);

export default connector(Address);
