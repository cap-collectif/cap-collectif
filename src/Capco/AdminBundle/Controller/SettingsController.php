<?php

namespace Capco\AdminBundle\Controller;

use Capco\AdminBundle\Admin\SiteParameterAdmin;
use Capco\AdminBundle\Resolver\FeaturesCategoryResolver;
use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Entity\SiteParameter;
use Capco\AppBundle\Repository\AbstractSSOConfigurationRepository;
use Capco\AppBundle\Repository\MenuItemRepository;
use Capco\AppBundle\Repository\SiteColorRepository;
use Capco\AppBundle\Repository\SiteImageRepository;
use Capco\AppBundle\Repository\SiteParameterRepository;
use Capco\AppBundle\Toggle\Manager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class SettingsController extends Controller
{
    protected const EXCLUDED_SETTINGS_KEYNAME = ['events.map.country'];
    private $SSOConfigurationRepository;
    private $menuItemRepository;

    public function __construct(
        AbstractSSOConfigurationRepository $SSOConfigurationRepository,
        MenuItemRepository $menuItemRepository
    ) {
        $this->SSOConfigurationRepository = $SSOConfigurationRepository;
        $this->menuItemRepository = $menuItemRepository;
    }

    /**
     * @Route("/admin/settings/pages.registration/list", name="capco_admin_settings_registration")
     * @Template("@CapcoAdmin/Settings/registration.html.twig")
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function registrationAction(Request $request)
    {
        $adminPool = $this->get('sonata.admin.pool');

        return [
            'breadcrumbs_builder' => $this->get('sonata.admin.breadcrumbs_builder'),
            'action' => 'list',
            'admin' => $this->get(SiteParameterAdmin::class),
            'admin_pool' => $adminPool,
        ];
    }

    /**
     * @Route("/admin/settings/pages.shield/list", name="capco_admin_settings_shield")
     * @Template("@CapcoAdmin/Settings/shield.html.twig")
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function shieldAction()
    {
        $adminPool = $this->get('sonata.admin.pool');

        return [
            'breadcrumbs_builder' => $this->get('sonata.admin.breadcrumbs_builder'),
            'action' => 'list',
            'admin' => $this->get(SiteParameterAdmin::class),
            'admin_pool' => $adminPool,
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
        $parameters = $this->getFeaturedParameters($category);
        $images = $this->get(SiteImageRepository::class)->findBy(
            [
                'category' => $category,
            ],
            ['position' => 'ASC']
        );
        $colors = $this->get(SiteColorRepository::class)->findBy(
            [
                'category' => $category,
            ],
            ['position' => 'ASC']
        );
        $featuresCategoryResolver = $this->get(FeaturesCategoryResolver::class);
        $toggles = $featuresCategoryResolver->getTogglesByCategory($category);
        $group = $featuresCategoryResolver->getGroupNameForCategory($category);

        return [
            'breadcrumbs_builder' => $this->get('sonata.admin.breadcrumbs_builder'),
            'action' => 'list',
            'admin' => $this->get(SiteParameterAdmin::class),
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
    public function switchToggleAction(string $toggle)
    {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }
        if (
            'display_map' !== $toggle &&
            !$this->get('security.authorization_checker')->isGranted('ROLE_SUPER_ADMIN')
        ) {
            throw $this->createAccessDeniedException();
        }
        $toggleManager = $this->get(Manager::class);
        $value = $toggleManager->switchValue($toggle);
        if ('developer_documentation' === $toggle) {
            /** Create a service that handle the `isEnabled` value of
             * the associated entities which is trigger when value is switched.
             */
            /** @var MenuItem $developerDocumentation */
            $developerDocumentation = $this->menuItemRepository->findOneByLink('developer');
            $developerDocumentation->setIsEnabled($value);
            $this->getDoctrine()
                ->getManager()
                ->flush();
        }
        /*  We set the `enabled` value of the SSOConfiguration as the same value as the feature toggle
         *  This can be moved to a listener or a service that handle all the actions that must be trigger
         *  by the feature toggle but it's not disturbing for now.
         */
        if (
            false === $value &&
            'login_franceconnect' === $toggle &&
            ($franceConnectConfiguration = $this->SSOConfigurationRepository->find('franceConnect'))
        ) {
            // @var $franceConnectConfiguration FranceConnectSSOConfiguration
            $franceConnectConfiguration->setEnabled($value);
            $this->getDoctrine()
                ->getManager()
                ->flush();
        }
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
                'category' => $category ?? 'settings.modules',
            ])
        );
    }

    private function getFeaturedParameters(string $category): array
    {
        $parameters = $this->get(SiteParameterRepository::class)->findBy(
            [
                'category' => $category,
            ],
            ['position' => 'ASC']
        );

        $parameters = array_filter($parameters, static function (SiteParameter $parameter) {
            return !\in_array($parameter->getKeyname(), self::EXCLUDED_SETTINGS_KEYNAME, true);
        });

        return $parameters;
    }
}
