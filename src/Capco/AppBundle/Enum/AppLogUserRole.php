<?php

namespace Capco\AppBundle\Enum;

final class AppLogUserRole
{
    public const ROLE_ADMIN = UserRole::ROLE_ADMIN;
    public const ROLE_PROJECT_ADMIN = UserRole::ROLE_PROJECT_ADMIN;
    public const ROLE_SUPER_ADMIN = UserRole::ROLE_SUPER_ADMIN;
    public const ORGANIZATION_ADMIN = OrganizationMemberRoleType::ADMIN;
    public const ORGANIZATION_USER = OrganizationMemberRoleType::USER;
}
