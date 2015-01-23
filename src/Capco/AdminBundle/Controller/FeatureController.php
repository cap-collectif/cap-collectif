<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;

class FeatureController extends Controller
{
    /**
     * @Route("/admin/features", name="admin_feature")
     * @Template()
     */
    public function listAction(Request $request)
    {
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
        $toggleManager = $this->get('capco.toggle.manager');
        $value = $toggleManager->switchValue($toggle);

        if ($value) {
            $message = $this->get('translator')->trans('The module has been enabled');
        } else {
            $message = $this->get('translator')->trans('The module has been disabled');
        }

        $this->get('sonata.core.flashmessage.manager')->getSession()->getFlashBag()->add('success', $message);

        return $this->redirect($this->generateUrl('admin_feature'));
    }
}
