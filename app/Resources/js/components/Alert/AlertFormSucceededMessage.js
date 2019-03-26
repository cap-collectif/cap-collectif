// @flow
import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

const TIME_BEFORE_HIDE_MESSAGE = 10000;

export default function AlertFormSucceededMessage() {
  const [showSucceededMessage, setShowSucceededMessage] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowSucceededMessage(false);
    }, TIME_BEFORE_HIDE_MESSAGE);

    return () => {
      clearTimeout(timeout);
    };
  });

  if (!showSucceededMessage) {
    return null;
  }

  return (
    <div className="alert__form_succeeded-message">
      <i className="cap cap-android-checkmark-circle" /> <FormattedMessage id="global.saved" />
    </div>
  );
}
