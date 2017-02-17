<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Security\Core\User\UserInterface;

class ShieldController extends Controller
{
    /**
     * @Route("/shield", name="shield", defaults={"_feature_flags" = "shield"})
     * @Cache(smaxage="60", public=true)
     * @Template("CapcoAppBundle:Default:shield.html.twig")
     */
    public function shieldAction()
    {
        if ($this->getUser() && $this->getUser() instanceof UserInterface) {
            return $this->redirectToRoute('app_homepage');
        }
        return [];
    }
}
