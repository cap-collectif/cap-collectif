<?php

namespace Capco\AppBundle\DBAL\Enum;

class ProposalRevisionStateType extends AbstractEnumType
{
    public const REVISED = 'revised';
    public const PENDING = 'pending';
    public const EXPIRED = 'expired';

    public static $revisionState = [self::REVISED, self::PENDING];

    protected $name = 'enum_proposal_revision_state';

    protected $values = [self::REVISED, self::PENDING];
}
