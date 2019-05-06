<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Toggle\Manager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SSOController extends Controller
{
    protected $toggleManager;

    public function __construct(Manager $toggleManager)
    {
        $this->toggleManager = $toggleManager;
    }

    /**
     * @Route("/sso/switch-user", name="app_sso_switch_user")
     * @Template("CapcoAppBundle:Default:sso_switch_user.html.twig")
     */
    public function switchUserAction(Request $request)
    {
        $user = $this->getUser();

        if (!$user || !$this->toggleManager->isActive('disconnect_openid')) {
            return $this->redirect('/');
        }

        return [];
    }
}
