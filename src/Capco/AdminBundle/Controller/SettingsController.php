<?php

namespace Capco\AdminBundle\Controller;

use Capco\AppBundle\Toggle\Manager;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Capco\AppBundle\Repository\SiteColorRepository;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AdminBundle\Resolver\FeaturesCategoryResolver;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class SettingsController extends Controller
{
    /**
     * @Route("/admin/settings/pages.registration/list", name="capco_admin_settings_registration")
     * @Template("@CapcoAdmin/Settings/registration.html.twig")
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function registrationAction(Request $request)
    {
        $adminPool = $this->get('sonata.admin.pool');

        return [
            'admin_pool' => $adminPool
        ];
    }

    /**
     * @Route("/admin/settings/pages.shield/list", name="capco_admin_settings_shield")
     * @Template("@CapcoAdmin/Settings/shield.html.twig")
     * @Security("has_role('ROLE_SUPER_ADMIN')")
     */
    public function shieldAction()
    {
        $adminPool = $this->get('sonata.admin.pool');

        return [
            'admin_pool' => $adminPool
        ];
    }

    /**
     * @Route("/admin/settings/{category}/list", name="capco_admin_settings")
     * @Template("CapcoAdminBundle:Settings:list.html.twig")
     */
    public function listAction(Request $request, $category)
    {
        $featuresCategoryResolver = $this->get(FeaturesCategoryResolver::class);
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        if (!$featuresCategoryResolver->isCategoryEnabled($category)) {
            throw $this->createNotFoundException();
        }

        $admin_pool = $this->get('sonata.admin.pool');

        $parameters = $this->get(SiteParameterRepository::class)->findBy(
            [
                'category' => $category
            ],
            ['position' => 'ASC']
        );

        $images = $this->get(SiteImageRepository::class)->findBy(
            [
                'category' => $category
            ],
            ['position' => 'ASC']
        );

        $colors = $this->get(SiteColorRepository::class)->findBy(
            [
                'category' => $category
            ],
            ['position' => 'ASC']
        );

        $featuresCategoryResolver = $this->get(FeaturesCategoryResolver::class);
        $toggles = $featuresCategoryResolver->getTogglesByCategory($category);
        $group = $featuresCategoryResolver->getGroupNameForCategory($category);

        return [
            'admin_pool' => $admin_pool,
            'category' => $category,
            'parameters' => $parameters,
            'colors' => $colors,
            'images' => $images,
            'toggles' => $toggles,
            'current_group_label' => $group
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

        if (
            'display_map' === $toggle &&
            !$this->get('security.authorization_checker')->isGranted('ROLE_SUPER_ADMIN')
        ) {
            throw $this->createAccessDeniedException();
        }

        $toggleManager = $this->get(Manager::class);
        $value = $toggleManager->switchValue($toggle);

        if ($value) {
            $message = $this->get('translator')->trans(
                'features.switch.enabled',
                [],
                'CapcoAppBundle'
            );
        } else {
            $message = $this->get('translator')->trans(
                'features.switch.disabled',
                [],
                'CapcoAppBundle'
            );
        }

        $this->get('sonata.core.flashmessage.manager')
            ->getSession()
            ->getFlashBag()
            ->add('success', $message);

        $category = $this->get(FeaturesCategoryResolver::class)->findCategoryForToggle($toggle);

        return $this->redirect(
            $this->generateUrl('capco_admin_settings', [
                'category' => $category ?? 'settings.modules'
            ])
        );
    }
}
