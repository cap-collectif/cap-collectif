<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class FeatureController extends Controller
{
    /**
     * @Route("/admin/features", name="admin_feature")
     * @Template()
     */
    public function listAction(Request $request)
    {
        if (false == $this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException();
        }

        $admin_pool = $this->get('sonata.admin.pool');
        $toggleManager = $this->get('capco.toggle.manager');
        $toggles = $toggleManager->all();

        return array(
            'admin_pool' => $admin_pool,
            'toggles' => $toggles
        );
    }

    /**
     * @Route("/admin/features/{toggle}/switch", name="admin_feature_switch")
     * @Template()
     */
    public function switchAction($toggle)
    {
        if (false == $this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException();
        }

        $toggleManager = $this->get('capco.toggle.manager');
        $value = $toggleManager->switchValue($toggle);

        if ($value) {
            $message = $this->get('translator')->trans('features.switch.enabled', array(), 'CapcoAppBundle');
        } else {
            $message = $this->get('translator')->trans('features.switch.disabled', array(), 'CapcoAppBundle');
        }

        $this->get('sonata.core.flashmessage.manager')->getSession()->getFlashBag()->add('success', $message);

        return $this->redirect($this->generateUrl('admin_feature'));
    }
}
