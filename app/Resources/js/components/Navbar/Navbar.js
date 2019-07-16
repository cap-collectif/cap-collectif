/* @flow */
import * as React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';

import TabsBar from '../Ui/TabsBar/TabsBar';
import NavigationSkip from './NavigationSkip';
import NavbarToggle from './NavbarToggle';

import * as S from './styles';

type Props = {|
  intl: IntlShape,
  logo?: ?string,
  items: Array<Object>,
  siteName: ?string,
  contentRight?: React.Element<Object>,
|};

type State = {|
  expanded: boolean,
  desktop: boolean,
  logoLoaded: boolean,
|};

export class Navbar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      expanded: false,
      desktop: true,
      logoLoaded: false,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  getAriaExpanded = () => {
    const { expanded } = this.state;

    this.setState({
      expanded: !expanded,
    });
  };

  handleResize = () => {
    if (window.matchMedia('(min-width: 768px)').matches) {
      this.setState({ desktop: true });
    } else {
      this.setState({ desktop: false });
    }
  };

  handleLoading = () => {
    // Wait the loading of logo to mount tabsbar because logo can have different width
    this.setState({ logoLoaded: true });
  };

  render() {
    const { logo, items, intl, siteName, contentRight } = this.props;
    const { expanded, logoLoaded, desktop } = this.state;

    return (
      <React.Fragment>
        <NavigationSkip />
        <S.NavigationContainer id="main-navbar" role="navigation">
          <S.NavigationHeader>
            {logo && (
              <S.Brand id="brand">
                <a href="/" title={intl.formatMessage({ id: 'navbar.homepage' })}>
                  <img src={logo} alt={siteName} onLoad={this.handleLoading} />
                </a>
              </S.Brand>
            )}
          </S.NavigationHeader>
          <NavbarToggle onClick={this.getAriaExpanded} expanded={expanded} />
          {desktop && logoLoaded && (
            <S.NavigationContentDesktop>
              {items.length > 0 && <TabsBar items={items} />}
              {contentRight && <S.NavigationContentRight>{contentRight}</S.NavigationContentRight>}
            </S.NavigationContentDesktop>
          )}
          {expanded && (
            <S.NavigationContentMobile>
              {items.length > 0 && <TabsBar items={items} overflowEnable={false} vertical />}
              {contentRight && (
                <S.NavigationContentRight vertical>
                  {React.cloneElement(contentRight, { vertical: true })}
                </S.NavigationContentRight>
              )}
            </S.NavigationContentMobile>
          )}
        </S.NavigationContainer>
      </React.Fragment>
    );
  }
}

export default injectIntl(Navbar);
