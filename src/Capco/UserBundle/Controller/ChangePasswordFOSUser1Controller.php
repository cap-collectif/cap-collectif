<?php

namespace Capco\UserBundle\Controller;

use FOS\UserBundle\Model\UserInterface;
use Sonata\UserBundle\Controller\ChangePasswordFOSUser1Controller as BaseController;

class ChangePasswordFOSUser1Controller extends BaseController
{
    protected function getRedirectionUrl(UserInterface $user)
    {
        return $this->generateUrl('sonata_user_profile_show');
    }
}
