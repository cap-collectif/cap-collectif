<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Enum\UserRole;
use Capco\AppBundle\Service\HtmlSitemapProjectsProvider;
use Capco\AppBundle\Toggle\Manager;
use Capco\AppBundle\Twig\FooterRuntime;
use Capco\AppBundle\Twig\NavigationRuntime;
use Capco\AppBundle\Twig\SiteColorRuntime;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Core\Role\RoleHierarchyInterface;

class SitemapResolver implements QueryInterface
{
    public function __construct(
        private readonly HtmlSitemapProjectsProvider $projects,
        private readonly NavigationRuntime $navigation,
        private readonly FooterRuntime $footer,
        private readonly SiteColorRuntime $colors,
        private readonly RequestStack $requests,
        private readonly RouterInterface $router,
        private readonly Manager $manager,
        private readonly RoleHierarchyInterface $hierarchy,
    ) {}

    /** @return array<string, mixed> */
    public function __invoke(?User $viewer): array
    {
        if ($this->manager->isActive(Manager::shield_mode) && (
            !$viewer || (
                $this->manager->isActive(Manager::shield_authorization_controls)
                && $this->manager->isActive(Manager::shield_authorized_users_only)
                && !\in_array(UserRole::ROLE_SHIELD_AUTHORIZED_USER, $this->hierarchy->getReachableRoleNames($viewer->getRoles()), true)
            )
        )) {
            throw new AccessDeniedHttpException();
        }

        $locale = $this->requests->getCurrentRequest()->getLocale();
        $homeUrl = $this->router->generate('app_homepage', ['_locale' => $locale]);
        $sitemapUrl = $this->router->generate('app_sitemap_html', ['_locale' => $locale]);

        return [
            'projects' => $this->projects->getProjects($locale),
            'headerItems' => $this->navigation->getHeaders($sitemapUrl, false),
            'footerLinks' => $this->footer->getFooterLinks(),
            'footerLegals' => $this->footer->getLegalsPages(false),
            'homeUrl' => $homeUrl,
            'sitemapUrl' => $sitemapUrl,
            'legalUrls' => [
                'cookies' => $this->router->generate('app_cookies', ['_locale' => $locale]),
                'privacy' => $this->router->generate('app_privacy', ['_locale' => $locale]),
                'legal' => $this->router->generate('app_legal', ['_locale' => $locale]),
            ],
            'linkColor' => $this->colors->getSiteColorValue('color.link.default'),
            'linkHoverColor' => $this->colors->getSiteColorValue('color.link.hover'),
        ];
    }
}
