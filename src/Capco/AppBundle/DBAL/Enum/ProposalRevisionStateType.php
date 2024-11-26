<?php

namespace Capco\AppBundle\DBAL\Enum;

class ProposalRevisionStateType extends AbstractEnumType
{
    final public const REVISED = 'revised';
    final public const PENDING = 'pending';
    final public const EXPIRED = 'expired';

    public static $revisionState = [self::REVISED, self::PENDING];

    protected string $name = 'enum_proposal_revision_state';

    protected array $values = [self::REVISED, self::PENDING];
}
