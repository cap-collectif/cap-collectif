// @flow
import * as React from 'react';
import { graphql, createFragmentContainer } from 'react-relay';
import { FormattedMessage } from 'react-intl';
import { Button, Panel } from 'react-bootstrap';
import styled from 'styled-components';
import type { OpinionAppendix_appendix } from './__generated__/OpinionAppendix_appendix.graphql';
import WYSIWYGRender from '../Form/WYSIWYGRender';

const AppendixTypeBody = styled.span`
  color: #707070;
  margin-left: 8px;
  font-weight: normal;
  font-style: italic;
  font-size: 16px;
`;

type Props = {
  appendix: OpinionAppendix_appendix,
  expanded?: boolean,
};

type State = {
  expanded: boolean,
};

class OpinionAppendix extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { expanded } = props;
    this.state = {
      expanded: !!expanded,
    };
  }

  toggle = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
  };

  renderCaret = () => {
    if (this.state.expanded) {
      return <i className="cap cap-arrow-68" />;
    }
    return <i className="cap cap-arrow-67" />;
  };

  renderContent = () => {
    const appendix = this.props.appendix;
    const style = this.state.expanded ? { marginBottom: '15px' } : {};
    return (
      <Panel
        expanded={this.state.expanded}
        onToggle={() => {}}
        style={style}
        className="opinion__appendix__content">
        <Panel.Collapse>
          <Panel.Body>
            <WYSIWYGRender value={appendix.body} />
          </Panel.Body>
        </Panel.Collapse>
      </Panel>
    );
  };

  render() {
    const appendix = this.props.appendix;

    if (!appendix.body) {
      return null;
    }

    return (
      <div className="opinion__appendix">
        <Button
          className="opinion__appendix__title"
          bsStyle="link"
          style={{ paddingLeft: '0', fontSize: '18px', fontWeight: '500' }}
          onClick={() => {
            this.toggle();
          }}
          title={
            this.state.expanded ? (
              <FormattedMessage
                id="opinion.appendices.hide"
                values={{
                  title: appendix.appendixType.title,
                }}
              />
            ) : (
              <FormattedMessage
                id="opinion.appendices.show"
                values={{
                  title: appendix.appendixType.title,
                }}
              />
            )
          }>
          {this.renderCaret()}
          {` ${appendix.appendixType.title}`}
          {appendix.appendixType.helpText && (
            <AppendixTypeBody>{`(${appendix.appendixType.helpText})`}</AppendixTypeBody>
          )}
        </Button>
        {this.renderContent()}
      </div>
    );
  }
}

export default createFragmentContainer(OpinionAppendix, {
  appendix: graphql`
    fragment OpinionAppendix_appendix on Appendix {
      body
      appendixType {
        title
        helpText
      }
    }
  `,
});
