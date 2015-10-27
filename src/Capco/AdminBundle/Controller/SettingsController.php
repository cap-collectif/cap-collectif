<?php

namespace Capco\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class SettingsController extends Controller
{
    /**
     * @Route("/admin/settings/{category}/list", name="capco_admin_settings")
     * @Template()
     */
    public function listAction(Request $request, $category)
    {
        if (false == $this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw new AccessDeniedException();
        }

        $admin_pool = $this->get('sonata.admin.pool');
        $em = $this->get('doctrine.orm.entity_manager');

        $parameters = $em->getRepository('CapcoAppBundle:SiteParameter')->findBy([
            'category' => $category,
        ], ['position' => 'ASC']);

        $images = $em->getRepository('CapcoAppBundle:SiteImage')->findBy([
            'category' => $category,
        ], ['position' => 'ASC']);

        $colors = $em->getRepository('CapcoAppBundle:SiteColor')->findBy([
            'category' => $category,
        ], ['position' => 'ASC']);

        $featuresCategoryResolver = $this->get('capco.admin.features_category_resolver');
        $toggles = $featuresCategoryResolver->getTogglesByCategory($category);
        $group = $featuresCategoryResolver->getGroupNameForCategory($category);

        return array(
            'admin_pool' => $admin_pool,
            'category' => $category,
            'parameters' => $parameters,
            'colors' => $colors,
            'images' => $images,
            'toggles' => $toggles,
            'current_group_label' => $group,
        );
    }

    /**
     * @Route("/admin/features/{toggle}/switch", name="capco_admin_feature_switch")
     * @Template()
     */
    public function switchToggleAction($toggle)
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

        $category = $this->get('capco.admin.features_category_resolver')->findCategoryForToggle($toggle);

        return $this->redirect($this->generateUrl('capco_admin_settings', ['category' => $category]));
    }
}
