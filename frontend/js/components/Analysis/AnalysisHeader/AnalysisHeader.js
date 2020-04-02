// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, type Match } from 'react-router-dom';
import AnalysisHeaderContainer from './AnalysisHeader.style';
import Icon, { ICON_NAME } from '~ui/Icons/Icon';

type Props = {
  match: Match,
};

const AnalysisHeader = ({ match }: Props) => {
  const { params } = match;
  const isProjectPage = !!params.projectSlug;

  return (
    <AnalysisHeaderContainer>
      {isProjectPage && (
        <Link to="/">
          <Icon name={ICON_NAME.chevronLeft} size={14} />
          <FormattedMessage id="my-projects" />
        </Link>
      )}
      <FormattedMessage tagName="h1" id="page.title.analysis.tool" />
    </AnalysisHeaderContainer>
  );
};

export default AnalysisHeader;
