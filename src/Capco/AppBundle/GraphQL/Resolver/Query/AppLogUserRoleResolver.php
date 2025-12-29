<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Enum\AppLogUserRole;
use Capco\AppBundle\Toggle\Manager;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class AppLogUserRoleResolver implements QueryInterface
{
    public function __construct(
        private readonly Manager $toggleManager,
    ) {
    }

    /**
     * @return string[]
     */
    public function __invoke(): array
    {
        $roles = [AppLogUserRole::ROLE_ADMIN, AppLogUserRole::ROLE_SUPER_ADMIN];

        if ($this->toggleManager->isActive('organizations')) {
            $roles = [
                ...$roles,
                ...[AppLogUserRole::ORGANIZATION_ADMIN, AppLogUserRole::ORGANIZATION_USER],
            ];
        }

        if ($this->toggleManager->isActive('project_admin')) {
            $roles = [
                ...$roles,
                ...[AppLogUserRole::ROLE_PROJECT_ADMIN],
            ];
        }

        return $roles;
    }
}
