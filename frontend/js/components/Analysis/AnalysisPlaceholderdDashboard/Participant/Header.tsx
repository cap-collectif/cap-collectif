import * as React from 'react'
import { FormattedMessage } from 'react-intl'
import Collapsable from '~ui/Collapsable'

const Header = () => (
  <>
    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="admin.label.step" />
      </Collapsable.Button>
    </Collapsable>

    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="admin.fields.source.category" />
      </Collapsable.Button>
    </Collapsable>

    <Collapsable align="right">
      <Collapsable.Button>
        <FormattedMessage id="argument.sort.label" />
      </Collapsable.Button>
    </Collapsable>
  </>
)

export default Header
