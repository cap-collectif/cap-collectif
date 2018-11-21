// @flow
import React from 'react';
import { IntlProvider } from 'react-intl-redux';

const onError = e => console.log(e);

export default (props: Object) => <IntlProvider onError={onError}>{props.children}</IntlProvider>;
