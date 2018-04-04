<?php

namespace Capco\AdminBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class SettingsController extends Controller
{
    /**
     * @Route("/admin/settings/pages.registration/list", name="capco_admin_settings_registration")
     * @Template()
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function registrationAction(Request $request)
    {
        $adminPool = $this->get('sonata.admin.pool');

        return [
            'admin_pool' => $adminPool,
        ];
    }

    /**
     * @Route("/admin/settings/{category}/list", name="capco_admin_settings")
     * @Template()
     *
     * @param mixed $category
     */
    public function listAction(Request $request, $category)
    {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $admin_pool = $this->get('sonata.admin.pool');
        $em = $this->get('doctrine')->getManager();

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

        return [
            'admin_pool' => $admin_pool,
            'category' => $category,
            'parameters' => $parameters,
            'colors' => $colors,
            'images' => $images,
            'toggles' => $toggles,
            'current_group_label' => $group,
        ];
    }

    /**
     * @Route("/admin/features/{toggle}/switch", name="capco_admin_feature_switch")
     * @Template()
     *
     * @param mixed $toggle
     */
    public function switchToggleAction($toggle)
    {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $toggleManager = $this->get('capco.toggle.manager');
        $value = $toggleManager->switchValue($toggle);

        if ($value) {
            $message = $this->get('translator')->trans('features.switch.enabled', [], 'CapcoAppBundle');
        } else {
            $message = $this->get('translator')->trans('features.switch.disabled', [], 'CapcoAppBundle');
        }

        $this->get('sonata.core.flashmessage.manager')->getSession()->getFlashBag()->add('success', $message);

        $category = $this->get('capco.admin.features_category_resolver')->findCategoryForToggle($toggle);

        return $this->redirect($this->generateUrl('capco_admin_settings', ['category' => $category ?? 'settings.modules']));
    }
}
