<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Enum\UserRole;

class UserInviteController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction()
    {
        $this->denyAccessUnlessGranted(UserRole::ROLE_ADMIN);

        return $this->renderWithExtraParams('CapcoAdminBundle:UserInvite:list.html.twig');
    }
}
