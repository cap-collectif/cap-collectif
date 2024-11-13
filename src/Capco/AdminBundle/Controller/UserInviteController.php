<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Enum\UserRole;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class UserInviteController extends \Sonata\AdminBundle\Controller\CRUDController
{
    public function listAction(Request $request): Response
    {
        $this->denyAccessUnlessGranted(UserRole::ROLE_ADMIN);

        return $this->renderWithExtraParams('@CapcoAdmin/UserInvite/list.html.twig');
    }
}
