// @flow
import React from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';

type Props = {|
  +color: string,
  +totalCount: number,
  +icon: string,
  +label: string,
|};

// <MetricsBox color='red' totalCount={20} icon='cap-file' label='capco.section.metrics.projects'/>

const MetricsBoxInner = styled.div.attrs({
  className: 'col-xs-6 col-md-4 col-lg-2',
})`
  background-color: ${props => props.color};
  padding: 20px;
  box-shadow: 1px 2px 0 #0808081a;
  border-radius: 3px;
  min-width: 225px;
  margin-bottom: 15px;
  margin-left: 10px;
`;

// const Label = styled.p`
//   /* color: red; */
// `;

const MetricsBox = (props: Props) => {
  return (
    <MetricsBoxInner>
      <span className="metrics-number">
        <i className={props.icon} />
        {props.totalCount}
      </span>
      <p>
        <FormattedMessage id="capco.section.metrics.projects" />
      </p>
    </MetricsBoxInner>
  );
};
export default MetricsBox;

/**
 *
 *
 * <SectionContainer>
 *   <MetricsRow>
 *      <MetricsBox color='red' totalCount={20} icon='cap-to'/>
 *      <MetricsBox color='blue' totalCount={20} icon='cap-to'/>
 *      <MetricsBox color='green' totalCount={20} icon='cap-to'/>
 *      <MetricsBox color='yellow' totalCount={20} icon='cap-to'/>
 *      <MetricsBox color='red' totalCount={20} icon='cap-to'/>
 *      <MetricsBox color='red' totalCount={20} icon='cap-to'/>
 *   </MetricsRow>
 * </SectionContainer>
 *
 *
 */
