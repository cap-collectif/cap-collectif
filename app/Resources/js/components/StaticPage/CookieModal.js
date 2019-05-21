// @flow
import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import { Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import CloseButton from '../Form/CloseButton';
import type { State } from '../../types';

type Props = {
  analyticsJs: ?string,
  adJs: ?string,
  separator?: string,
  platformLink: string,
};

type CookieModalState = {
  showModal: boolean,
};

export class CookieModal extends React.Component<Props, CookieModalState> {
  cookie: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
    };
  }

  render() {
    const { analyticsJs, adJs, separator, platformLink } = this.props;
    const { showModal } = this.state;

    let CookieType = -1;

    if (analyticsJs !== '' && adJs === '') {
      CookieType = 0;
    } else if (adJs !== '' && analyticsJs === '') {
      CookieType = 2;
    } else if (adJs !== '' && analyticsJs !== '') {
      CookieType = 3;
    }

    return (
      <div className="cookie-policy">
        <div>
          {separator && <span>{separator}</span>}
          <Button
            id="cookies-management"
            className="p-0"
            variant="link"
            bsStyle="link"
            onClick={() => {
              this.setState({ showModal: true });
            }}
            name="cookies">
            <FormattedMessage id="cookies" />
          </Button>
        </div>
        <Modal
          animation={false}
          show={showModal}
          onHide={() => {
            this.setState({ showModal: false });
          }}
          bsSize="large"
          id="cookies-modal"
          className="cookie-policy"
          aria-labelledby="contained-modal-title-lg">
          <Modal.Header closeButton className="cookie-policy">
            <Modal.Title id="contained-modal-title-lg" className="cookie-policy">
              <FormattedMessage id="cookies" />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div>
              <section className="section--custom">
                {CookieType > 0 ? (
                  <div>
                    <FormattedHTMLMessage id="cookies-page-texte-part1" values={{ platformLink }} />
                  </div>
                ) : (
                  <div>
                    <FormattedHTMLMessage id="cookies-page-texte-part1" values={{ platformLink }} />
                  </div>
                )}
                <FormattedHTMLMessage id="cookies-page-texte-part1-2" values={{ platformLink }} />
                <FormattedHTMLMessage id="cookies-page-texte-part2" values={{ platformLink }} />
              </section>
            </div>
          </Modal.Body>
          <Modal.Footer className="cookie-policy">
            <CloseButton
              buttonId="cookies-cancel"
              onClose={() => {
                this.setState({ showModal: false });
              }}
            />
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  analyticsJs: state.default.parameters['snalytical-tracking-scripts-on-all-pages'],
  adJs: state.default.parameters['ad-scripts-on-all-pages'],
});

export default connect(mapStateToProps)(CookieModal);
