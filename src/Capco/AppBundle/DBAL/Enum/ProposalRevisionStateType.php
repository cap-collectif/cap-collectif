<?php

namespace Capco\AppBundle\DBAL\Enum;

class ProposalRevisionStateType extends AbstractEnumType
{
    public const REVISED = 'revised';
    public const PENDING = 'pending';
    public const EXPIRED = 'expired';

    public static $revisionState = [self::REVISED, self::PENDING];

    protected string $name = 'enum_proposal_revision_state';

    protected array $values = [self::REVISED, self::PENDING];
}
