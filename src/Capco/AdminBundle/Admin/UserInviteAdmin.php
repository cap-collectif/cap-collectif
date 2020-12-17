<?php

namespace Capco\AdminBundle\Admin;

use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Toggle\Manager;
use Sonata\AdminBundle\Admin\AbstractAdmin;
use Sonata\AdminBundle\Route\RouteCollection;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UserInviteAdmin extends AbstractAdmin
{
    protected $baseRouteName = 'capco_admin_user_invite';
    protected $baseRoutePattern = 'capco/user/invite';
    private AuthorizationCheckerInterface $checker;
    private Manager $manager;

    public function __construct(
        $code,
        $class,
        $baseControllerName,
        AuthorizationCheckerInterface $checker,
        Manager $manager
    ) {
        parent::__construct($code, $class, $baseControllerName);
        $this->checker = $checker;
        $this->manager = $manager;
    }

    public function showIn($context)
    {
        return $this->checker->isGranted(UserRole::ROLE_ADMIN);
    }

    protected function configureRoutes(RouteCollection $collection)
    {
        $collection->clearExcept(['list']);
    }
}
