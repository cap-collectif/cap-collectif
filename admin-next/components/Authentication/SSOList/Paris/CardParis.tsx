import type { FC } from 'react';
import CardSSO from '@ui/CardSSO/CardSSO';
import { Switch, Text } from '@cap-collectif/ui';
import logo from './Logo';

/**
 * @deprecated
 */
const CardParis: FC = () => (
    <CardSSO>
        <CardSSO.Header>{logo}</CardSSO.Header>
        <CardSSO.Body>
            <Text as="label" color="gray.900" fontSize={3} htmlFor="mon-compte-paris" opacity={0.3}>
                MonCompteParis
            </Text>

            <Switch id="mon-compte-paris" checked disabled />
        </CardSSO.Body>
    </CardSSO>
);

export default CardParis;
