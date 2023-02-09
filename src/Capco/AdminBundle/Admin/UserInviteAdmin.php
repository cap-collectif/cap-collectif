<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Enum\UserRole;
use Sonata\AdminBundle\Route\RouteCollectionInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UserInviteAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_user_invite';
    protected $baseRoutePattern = 'capco/user/invite';
    private AuthorizationCheckerInterface $checker;

    public function __construct(
        $code,
        $class,
        $baseControllerName,
        AuthorizationCheckerInterface $checker
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->checker = $checker;
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
