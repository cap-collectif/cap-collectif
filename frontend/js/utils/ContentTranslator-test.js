// @flow

import React from "react";
import {FormattedMessage} from "react-intl";
import {translateContent} from "~/utils/ContentTranslator";

describe('contentTranslator', () => {
  it('Should translate a deleted title', () => {
    expect(translateContent('deleted-title')).toEqual(<FormattedMessage id='deleted-title' />);
  });

  it('Should ignore other title', () => {
    expect(translateContent('not-deleted-title')).toEqual('not-deleted-title');
  });
});
