// @flow
import * as React from 'react';
import { injectIntl, type IntlShape } from 'react-intl';

import TabsItem from './TabsItem';
import TabsBarDropdown from './TabsBarDropdown';

import * as S from './styles';

type Props = {|
  intl: IntlShape,
  items: Array<Object>,
  /*
   * Whether or not the TabsBar can have an overflow, this should be `true` on mobile devices.
   */
  overflowEnable?: boolean,
  /*
   * Whether the TabsBar is vertical or horizontal, it should be `true` on mobile devices
   */
  vertical?: boolean,
|};

type State = {|
  shouldRender: boolean,
  shouldDisplaySeeMore: boolean,
  overflowIndex: number,
|};

export class TabsBar extends React.Component<Props, State> {
  containerWidth: number;

  seeMoreWidth: number;

  containerRef: Object;

  seeMoreRef: Object;

  itemsWidth: Array<number>;

  static defaultProps = {
    overflowEnable: true,
    vertical: false,
  };

  constructor(props: Props) {
    super(props);

    // Usefull for mobile case
    if (props.overflowEnable) {
      this.state = {
        shouldRender: false,
        shouldDisplaySeeMore: true,
        overflowIndex: props.items.length,
      };
    } else {
      this.state = {
        shouldRender: true,
        shouldDisplaySeeMore: false,
        overflowIndex: props.items.length,
      };
    }

    this.itemsWidth = [];
    this.containerRef = null;
    this.seeMoreRef = null;
  }

  componentDidMount() {
    const { overflowEnable } = this.props;

    if (overflowEnable) {
      this.handleOverflow();
      window.addEventListener('resize', this.handleOverflow);
    }
  }

  componentWillUnmount() {
    const { overflowEnable } = this.props;

    if (overflowEnable) {
      window.removeEventListener('resize', this.handleOverflow);
    }
  }

  setContainerRef = (element: React.Node) => {
    this.containerRef = element;
  };

  setSeeMoreRef = (element: React.Node) => {
    this.seeMoreRef = element;
  };

  getSeeMoreWidth = (): number => {
    if (this.seeMoreRef) {
      const { width } = this.seeMoreRef.getBoundingClientRect();
      return width;
    }

    return 0;
  };

  getContainerWidth = (): number => {
    if (this.containerRef) {
      const { width } = this.containerRef.getBoundingClientRect();
      return width;
    }

    return 0;
  };

  getTotalItemsWidth = (): number => this.itemsWidth.reduce((acc, val) => acc + val, 0);

  handleItemWidth = (element: Object) => {
    if (element) {
      this.itemsWidth.push(element.offsetWidth);
    }
  };

  handleOverflow = () => {
    const { items } = this.props;
    this.seeMoreWidth = !this.seeMoreWidth ? this.getSeeMoreWidth() : this.seeMoreWidth;
    this.containerWidth = this.getContainerWidth();
    const totalItemsWidth = this.getTotalItemsWidth();

    if (totalItemsWidth > this.containerWidth) {
      const overflowIndex = this.getOverflowIndex(this.seeMoreWidth, this.containerWidth);

      this.setState({
        shouldDisplaySeeMore: overflowIndex < items.length,
        overflowIndex,
      });
    } else {
      this.setState({
        shouldDisplaySeeMore: false,
        overflowIndex: items.length,
      });
    }

    this.setState({ shouldRender: true });
  };

  getOverflowIndex = (initWidth: number, maxWidth: number): number => {
    const { items } = this.props;

    if (this.itemsWidth) {
      let counter = initWidth;

      let maxIndex = items.length;

      // Break the loop when accumulation of items width is greater than container size
      // Then, save the index to get the maximum number of items to display
      for (let index = 0; index < maxIndex; index++) {
        counter += this.itemsWidth[index];
        if (counter >= maxWidth) {
          maxIndex = index;
          break;
        }
      }
      return maxIndex;
    }

    return items.length;
  };

  getDisplayedItems = (): Array<Object> => {
    const { items } = this.props;
    const { overflowIndex } = this.state;
    return items.filter((item, index) => index < overflowIndex);
  };

  getOverflowedItems = (): Array<Object> => {
    const { items } = this.props;
    const { overflowIndex } = this.state;
    return items.filter((item, index) => index >= overflowIndex);
  };

  renderSeeMore = () => {
    const { intl, vertical } = this.props;
    const overflowedItems = this.getOverflowedItems();
    const seeMoreItem = {
      title: intl.formatMessage({ id: 'global.navbar.see_more' }),
      children: overflowedItems,
    };

    return (
      // $FlowFixMe ref on a styled component
      <S.TabsItemContainer vertical={vertical} ref={this.setSeeMoreRef}>
        <TabsBarDropdown
          item={seeMoreItem}
          id="tabsbar-dropdown-see-more"
          toggleElement={intl.formatMessage({ id: 'global.navbar.see_more' })}
          intl={intl}
        />
      </S.TabsItemContainer>
    );
  };

  render() {
    const { intl, vertical } = this.props;
    const { shouldDisplaySeeMore, shouldRender } = this.state;
    const displayedItems = this.getDisplayedItems();

    return (
      // $FlowFixMe ref on a styled component
      <S.TabsBarContainer show={shouldRender} vertical={vertical} ref={this.setContainerRef}>
        {displayedItems.map((item, index) => (
          <S.TabsItemContainer key={index} vertical={vertical} ref={this.handleItemWidth}>
            <TabsItem item={item} intl={intl} vertical={vertical} />
          </S.TabsItemContainer>
        ))}
        {shouldDisplaySeeMore && this.renderSeeMore()}
      </S.TabsBarContainer>
    );
  }
}

export default injectIntl(TabsBar);
