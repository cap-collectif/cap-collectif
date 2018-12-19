// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import LoginOverlay from '../Utils/LoginOverlay';
import { type State } from '../../types';

type Props = {
  link: string,
  user: ?Object,
};

export class ProjectTrashButton extends React.PureComponent<Props> {
  render() {
    const { link, user } = this.props;
    return (
      <div className="container text-center">
        <div className="row">
          <h3 className="mt-0">
            <FormattedMessage id="project.show.trashed.short_name" />
          </h3>
          <p className="excerpt">
            <FormattedMessage id="project.show.trashed.text" />
          </p>
          <LoginOverlay>
            <a
              id="trash-link"
              href={user ? link : null}
              style={{ display: 'block', borderColor: 'transparent !important' }}>
              <p>
                <FormattedMessage id="project.show.trashed.display" />
              </p>
            </a>
          </LoginOverlay>
        </div>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<*, *, *> = (state: State) => ({
  user: state.user.user,
});

export default connect(mapStateToProps)(ProjectTrashButton);
