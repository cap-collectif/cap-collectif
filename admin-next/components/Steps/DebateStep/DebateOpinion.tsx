import * as React from 'react';
import {graphql, useFragment} from 'react-relay';
import {FormattedMessage, useIntl} from 'react-intl';
import WYSIWYGRender from '@components/WYSIWYGRender/WYSIWYGRender';
import UserAvatar from '@components/UserAvatar/UserAvatar';
import { Flex, Card, Tag, Text, ButtonQuickAction, CapUIIcon } from '@cap-collectif/ui';
import {DebateOpinion_debateOpinion$key} from "@relay/DebateOpinion_debateOpinion.graphql";

type Props = {
    debateOpinion: DebateOpinion_debateOpinion$key,
    onEdit: () => void,
    onDelete: () => void,
};

const DEBATE_OPINION_FRAGMENT = graphql`
    fragment DebateOpinion_debateOpinion on DebateOpinion {
      type
      title
      body
      author {
        username
        ...UserAvatar_user
      }
    }
`


const DebateOpinion = ({ debateOpinion: debateOpinionRef, onEdit, onDelete }: Props) => {
    const intl = useIntl();
    const debateOpinion = useFragment(DEBATE_OPINION_FRAGMENT, debateOpinionRef);
    const { title, body, author, type } = debateOpinion;
    const [hovering, setHovering] = React.useState<boolean>(false);

    return (
        <Card
            p={0}
            bg="white"
            flex="1"
            position="relative"
            overflowY="scroll"
            maxHeight="400px"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}>
            <Tag
                variantColor={type === 'FOR' ? 'green' : 'red'}
                sx={{
                    position: 'absolute',
                    top: '-1px',
                    left: '-1px',
                }}
                borderBottomLeftRadius={0}
                borderTopRightRadius={0}
            >
                <Text fontWeight={600}>
                    {intl.formatMessage({ id: type === 'FOR' ? 'opinion.for' : 'opinion.against' }).toUpperCase()}
                </Text>
            </Tag>

            {hovering && (
                <Flex
                    direction="row"
                    sx={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                    }}
                >
                    <ButtonQuickAction
                        type="button"
                        icon={CapUIIcon.Pencil}
                        label={<FormattedMessage id="global.change" />}
                        onClick={onEdit}
                        variantColor="green"
                    />
                    <ButtonQuickAction
                        type="button"
                        icon={CapUIIcon.Trash}
                        label={<FormattedMessage id="global.delete" />}
                        onClick={onDelete}
                        variantColor="red"
                    />
                </Flex>
            )}

            <Flex direction="column" pt={6} px={6} pb={6} maxHeight="100%">
                <Flex direction="row" spacing={2} mb={4} align="center">
                    <UserAvatar
                        user={author}
                        size="md"
                        border="2px solid"
                        borderColor="yellow.500"
                    />
                    <Text fontSize={3} color="gray.500">
                        {author.username}
                    </Text>
                </Flex>
                <Flex direction="column" spacing={2} maxHeight="100%" overflow="hidden">
                    <Text fontWeight="600">{title}</Text>
                    <WYSIWYGRender value={body} />
                </Flex>
            </Flex>
        </Card>
    );
};

export default DebateOpinion

