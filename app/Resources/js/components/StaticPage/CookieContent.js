// @flow
import React from 'react';
import { FormattedHTMLMessage } from 'react-intl';
import { connect } from 'react-redux';
import type { State } from '../../types';
import { baseUrl } from '../../config';

type Props = {
  analyticsJs: ?string,
  adJs: ?string,
  cookiesList: string,
  cookiesList: string,
};

export class CookieContent extends React.Component<Props, State> {
  render() {
    const { analyticsJs, adJs, cookiesList } = this.props;
    let cookieType = -1;
    let nbCookies = 0;

    if (analyticsJs !== '' && adJs === '') {
      cookieType = 0;
      nbCookies = 1;
    } else if (adJs !== '' && analyticsJs === '') {
      cookieType = 2;
      nbCookies = 1;
    } else if (adJs !== '' && analyticsJs !== '') {
      cookieType = 3;
      nbCookies = 2;
    }

    return (
      <div>
        {cookieType > 0 ? (
          <div>
            <FormattedHTMLMessage
              id="cookies-page-texte-tmp-part1"
              values={{ platformLink: baseUrl, cookieType }}
            />
          </div>
        ) : (
          <div>
            <FormattedHTMLMessage
              id="cookies-page-texte-part1"
              values={{ platformLink: baseUrl }}
            />
          </div>
        )}
        <FormattedHTMLMessage id="cookies-page-texte-part1-2" values={{ platformLink: baseUrl }} />
        <FormattedHTMLMessage
          id="cookies-page-texte-tmp-part1-3"
          values={{ platformLink: baseUrl, nbCookies }}
        />
        <div className="content" dangerouslySetInnerHTML={{ __html: cookiesList }} />
        <FormattedHTMLMessage id="cookies-page-texte-part2" values={{ platformLink: baseUrl }} />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  analyticsJs: state.default.parameters['snalytical-tracking-scripts-on-all-pages'],
  adJs: state.default.parameters['ad-scripts-on-all-pages'],
  cookiesList: state.default.parameters['cookies-list'],
});

export default connect(mapStateToProps)(CookieContent);
