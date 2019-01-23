// @flow
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { ButtonGroup, Button, Modal } from 'react-bootstrap';
import { connect } from 'react-redux';
import CloseButton from '../Form/CloseButton';
import Cookie from './Cookie';
import CookieMonster from '../../CookieMonster';
import type { State } from '../../types';

type Props = {
  analyticsJs: ?string,
  adJs: ?string,
  bannerTrad: string,
  isLink: boolean,
};

type CookieModalState = {
  showModal: boolean,
};

export class CookieModal extends React.Component<Props, CookieModalState> {
  static defaultProps = {
    isLink: false,
  };

  cookie: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      showModal: false,
    };
    this.cookie = React.createRef();
  }

  saveCookie = () => {
    this.cookie.current.saveCookiesConfiguration();
    this.setState({ showModal: false });
  };

  render() {
    const { isLink, analyticsJs, adJs, bannerTrad } = this.props;
    const { showModal } = this.state;
    return (
      <div className="cookie-manager">
        {isLink ? (
          <div>
            |
            <Button
              bsStyle="link"
              id="cookies-management"
              href="#"
              onClick={() => {
                this.setState({ showModal: true });
              }}>
              <FormattedMessage id="cookies-management" />
            </Button>
          </div>
        ) : (
          <div id="cookie-banner" className="cookie-banner">
            <div className="col-sm-9">
              <FormattedMessage id={bannerTrad} />
            </div>
            <div className="col-sm-3 d-flex justify-content-end">
              <Button
                id="cookie-more-button"
                className="mr-10 mt-10"
                bsStyle="default"
                onClick={() => {
                  this.setState({ showModal: true });
                }}
                name="cookie-more">
                <FormattedMessage id="cookies-setting" />
              </Button>
              <div id="cookie-button-container">
                <Button
                  id="cookie-consent"
                  bsStyle="default"
                  className="btn btn-default btn-sm mt-10"
                  onClick={() => {
                    CookieMonster.considerFullConsent();
                  }}>
                  <FormattedMessage id="ok-accept-everything" />
                </Button>
              </div>
            </div>
          </div>
        )}
        <div>
          <Modal
            animation={false}
            show={showModal}
            onHide={() => {
              this.setState({ showModal: false });
            }}
            bsSize="large"
            id="cookies-modal"
            className="cookie-manager"
            aria-labelledby="contained-modal-title-lg">
            <Modal.Header closeButton className="cookie-manager">
              <Modal.Title id="contained-modal-title-lg" className="cookie-manager">
                <FormattedMessage id="cookies-management" />
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Cookie analyticsJs={analyticsJs} adJs={adJs} ref={this.cookie} />
            </Modal.Body>
            <Modal.Footer className="cookie-manager">
              <ButtonGroup className="d-inline-block cookie-manager">
                <CloseButton
                  buttonId="cookies-cancel"
                  onClose={() => {
                    this.setState({ showModal: false });
                  }}
                />
                <button
                  className="ml-15 btn btn-primary"
                  id="cookies-save"
                  onClick={this.saveCookie}>
                  <FormattedMessage id="global.save" />
                </button>
              </ButtonGroup>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  analyticsJs: state.default.parameters['snalytical-tracking-scripts-on-all-pages'],
  adJs: state.default.parameters['ad-scripts-on-all-pages'],
});

export default connect(mapStateToProps)(CookieModal);
