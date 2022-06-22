<?php

namespace Capco\AppBundle\DBAL\Enum;

class OrganizationMemberRoleType extends AbstractEnumType
{
    public const ADMIN = 'admin';
    public const USER = 'user';

    protected string $name = 'enum_organization_member_role_type';

    protected array $values = [self::ADMIN, self::USER];
}
