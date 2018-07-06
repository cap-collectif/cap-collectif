<?php
namespace Capco\AppBundle\Traits;

use \Symfony\Bundle\FrameworkBundle\Controller\ControllerTrait as BaseControllerTrait;

trait ControllerTrait
{
    use BaseControllerTrait;

    public function getUser()
    {

        if (null === $token = $this->tokenStorage->getToken()) {
            return;
        }

        if (!is_object($user = $token->getUser())) {
            // e.g. anonymous authentication
            return;
        }

        return $user;
    }
}
