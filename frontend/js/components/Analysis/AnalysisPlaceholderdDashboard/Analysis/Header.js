// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Collapsable from '~ui/Collapsable';

type Props = {
  isAdmin?: boolean,
};

const Header = ({ isAdmin }: Props) => (
  <>
    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="admin.fields.proposal.map.zone" />
      </Collapsable.Button>
    </Collapsable>

    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="admin.fields.proposal.category" />
      </Collapsable.Button>
    </Collapsable>

    {isAdmin && (
      <Collapsable align="right">
        <Collapsable.Button>
          <FormattedMessage id="table.header.filter.progress" />
        </Collapsable.Button>
      </Collapsable>
    )}

    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="panel.analysis.subtitle" />
      </Collapsable.Button>
    </Collapsable>

    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="global.review" />
      </Collapsable.Button>
    </Collapsable>

    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="global.decision" />
      </Collapsable.Button>
    </Collapsable>

    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="argument.sort.label" />
      </Collapsable.Button>
    </Collapsable>
  </>
);

export default Header;
