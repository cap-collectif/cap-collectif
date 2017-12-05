// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { change } from 'redux-form';
import type { Connector } from 'react-redux';
import PlacesAutocomplete, { geocodeByAddress } from 'react-places-autocomplete';
import type { Dispatch } from '../../types';

type PassedProps = {
  onChange: Function,
  value: any,
  name: string,
  id: string,
  placeholder: string,
  formName: string,
  disabled: boolean,
  error: ?string,
};
type DefaultProps = { disabled: boolean };
type Props = PassedProps & DefaultProps & { updateAddressValue: (value: ?string) => void };

const autocompleteItem = ({
  formattedSuggestion,
}: {
  formattedSuggestion: { mainText: string, secondaryText: string },
}) => (
  <div className="places-autocomplete">
    <strong>{formattedSuggestion.mainText}</strong> {formattedSuggestion.secondaryText}
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
    const { error, placeholder, value, id, onChange } = this.props;
    return (
      <PlacesAutocomplete
        inputProps={{
          onChange: (address: ?string) => {
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
          root: `${error ? 'form-control-warning' : ''}`,
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
    );
  }
}

const mapDispatchToProps = (dispatch: Dispatch, props: PassedProps) => ({
  updateAddressValue: value => {
    dispatch(change(props.formName, 'address', value));
  },
});

const connector: Connector<PassedProps, Props> = connect(null, mapDispatchToProps);

export default connector(Address);
