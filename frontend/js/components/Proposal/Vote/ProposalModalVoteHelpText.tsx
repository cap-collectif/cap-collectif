import React from 'react';
import { InfoMessage } from '@cap-collectif/ui'
import { isInterpellationContextFromStep } from '~/utils/interpellationLabelHelper'
import WYSIWYGRender from '@shared/form/WYSIWYGRender'
import { useIntl } from 'react-intl'

type Props = {
  votesHelpText?: string,
  step: any
}

const stripHtmlTags = (input: string) => {
  let text = input.replace(/<\/?[^>]+(>|$)/g, "");

  text = text.replace(/&[^;]+;/g, "");

  text = text.trim()

  return text;
}

export const ProposalModalVoteHelpText: React.FC<Props> = ({ votesHelpText, step }) => {

  const intl = useIntl();

  if (!votesHelpText) return null;

  const rawText = stripHtmlTags(votesHelpText);

  if (!rawText) return null;

  return (
    <InfoMessage variant="info" width="100%">
      <InfoMessage.Title>
        {intl.formatMessage({
          id: isInterpellationContextFromStep(step)
            ? 'admin.fields.step.supportsHelpText'
            : 'admin.fields.step.votesHelpText',
        })}
      </InfoMessage.Title>
      <InfoMessage.Content>
        <WYSIWYGRender value={votesHelpText} />
      </InfoMessage.Content>
    </InfoMessage>
  )
}