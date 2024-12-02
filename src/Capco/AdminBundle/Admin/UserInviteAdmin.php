<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Enum\UserRole;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UserInviteAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_user_invite';
    protected $baseRoutePattern = 'capco/user/invite';

    public function __construct(
        $code,
        $class,
        $baseControllerName,
        private readonly AuthorizationCheckerInterface $checker
    ) {
        parent::__construct($code, $class, $baseControllerName);
    }

    public function showIn($context): bool
    {
        return $this->checker->isGranted(UserRole::ROLE_ADMIN);
    }

    protected function configureRoutes(RouteCollectionInterface $collection): void
    {
        $collection->clearExcept(['list']);
    }
}
