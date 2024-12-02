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
use Capco\AppBundle\Security\SettingsVoter;
use Capco\AppBundle\Toggle\Manager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sonata\AdminBundle\Admin\BreadcrumbsBuilderInterface;
use Sonata\AdminBundle\Admin\Pool;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class SettingsController extends Controller
{
    protected const EXCLUDED_SETTINGS_KEYNAME = ['events.map.country'];

    public function __construct(private readonly AbstractSSOConfigurationRepository $SSOConfigurationRepository, private readonly MenuItemRepository $menuItemRepository, private readonly FeaturesCategoryResolver $featuresCategoryResolver, private readonly BreadcrumbsBuilderInterface $breadcrumbsBuilder, private readonly Pool $pool, private readonly SiteParameterRepository $siteParameterRepository, private readonly SiteParameterAdmin $siteParameterAdmin, private readonly SiteImageRepository $siteImageRepository, private readonly SiteColorRepository $siteColorRepository, private readonly Manager $manager, private readonly TranslatorInterface $translator)
    {
    }

    /**
     * @Route("/admin/settings/pages.registration/list", name="capco_admin_settings_registration")
     * @Template("@CapcoAdmin/Settings/registration.html.twig")
     * @Security("has_role('ROLE_ADMIN')")
     */
    public function registrationAction(Request $request): array
    {
        return [
            'breadcrumbs_builder' => $this->breadcrumbsBuilder,
            'action' => 'list',
            'admin' => $this->siteParameterAdmin,
            'admin_pool' => $this->pool,
        ];
    }

    /**
     * @Route("/admin/settings/pages.shield/list", name="capco_admin_settings_shield")
     * @Template("@CapcoAdmin/Settings/shield.html.twig")
     * @Security("has_role('ROLE_ADMIN')")
     *
     * @deprecated Replace by our NextJs router so this is not used anymore
     */
    public function shieldAction()
    {
        return [
            'breadcrumbs_builder' => $this->breadcrumbsBuilder,
            'admin_pool' => $this->pool,
            'action' => 'list',
            'admin' => $this->siteParameterAdmin,
        ];
    }

    /**
     * @Route("/admin/settings/{category}/list", name="capco_admin_settings")
     * @Template("@CapcoAdmin/Settings/list.html.twig")
     */
    public function listAction(Request $request, mixed $category)
    {
        if (!$this->isGranted(SettingsVoter::VIEW, $category)) {
            throw $this->createAccessDeniedException();
        }

        if (!$this->featuresCategoryResolver->isCategoryEnabled($category)) {
            throw $this->createNotFoundException();
        }
        $parameters = $this->getFeaturedParameters($category);
        $images = $this->siteImageRepository->findBy(
            [
                'category' => $category,
            ],
            ['position' => 'ASC']
        );
        $colors = $this->siteColorRepository->findBy(
            [
                'category' => $category,
            ],
            ['position' => 'ASC']
        );
        $toggles = $this->featuresCategoryResolver->getTogglesByCategory($category);
        $group = $this->featuresCategoryResolver->getGroupNameForCategory($category);

        return [
            'breadcrumbs_builder' => $this->breadcrumbsBuilder,
            'admin_pool' => $this->pool,
            'action' => 'list',
            'admin' => $this->siteParameterAdmin,
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
     * TODO this is a security breach (GET request), delete me when we rebuild features page.
     */
    public function switchToggleAction(string $toggle): RedirectResponse
    {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
            throw $this->createAccessDeniedException();
        }

        $adminAllowedFeatures = array_merge(Manager::ADMIN_ALLOWED_FEATURES, [
            Manager::allow_users_to_propose_events,
        ]);
        if (
            !\in_array($toggle, $adminAllowedFeatures)
            && !$this->get('security.authorization_checker')->isGranted('ROLE_SUPER_ADMIN')
        ) {
            throw $this->createAccessDeniedException();
        }

        $value = $this->manager->switchValue($toggle);
        if ('developer_documentation' === $toggle) {
            /** Create a service that handle the `isEnabled` value of
             * the associated entities which is trigger when value is switched.
             */
            /** @var MenuItem $developerDocumentation */
            $developerDocumentation = $this->menuItemRepository->findOneByLink('developer');
            $developerDocumentation->setIsEnabled($value);
            $this->getDoctrine()
                ->getManager()
                ->flush()
            ;
        }
        /*  We set the `enabled` value of the SSOConfiguration as the same value as the feature toggle
         *  This can be moved to a listener or a service that handle all the actions that must be trigger
         *  by the feature toggle but it's not disturbing for now.
         */
        if (
            false === $value
            && 'login_franceconnect' === $toggle
            && ($franceConnectConfiguration = $this->SSOConfigurationRepository->find('franceConnect'))
        ) {
            // @var $franceConnectConfiguration FranceConnectSSOConfiguration
            $franceConnectConfiguration->setEnabled($value);
            $this->getDoctrine()
                ->getManager()
                ->flush()
            ;
        }
        if ($value) {
            $message = $this->translator->trans('features.switch.enabled', [], 'CapcoAppBundle');
        } else {
            $message = $this->translator->trans('features.switch.disabled', [], 'CapcoAppBundle');
        }
        $this->get('session')
            ->getFlashBag()
            ->add('success', $message)
        ;
        $category = $this->featuresCategoryResolver->findCategoryForToggle($toggle);

        return $this->redirect(
            $this->generateUrl('capco_admin_settings', [
                'category' => $category ?? 'settings.modules',
            ])
        );
    }

    private function getFeaturedParameters(string $category): array
    {
        $parameters = $this->siteParameterRepository->findBy(
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
