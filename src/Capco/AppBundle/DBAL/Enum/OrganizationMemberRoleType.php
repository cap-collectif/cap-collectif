<?php

namespace Capco\AppBundle\DBAL\Enum;

class OrganizationMemberRoleType extends AbstractEnumType
{
    final public const ADMIN = 'admin';
    final public const USER = 'user';

    protected string $name = 'enum_organization_member_role_type';

    protected array $values = [self::ADMIN, self::USER];
}
