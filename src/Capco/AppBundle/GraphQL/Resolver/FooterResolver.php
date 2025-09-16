<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\RouterInterface;

class FooterResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router,
        private readonly FooterSocialNetworksResolver $footerSocialNetworksResolver,
        private readonly SiteParameterResolver $siteParameterResolver,
    ) {
    }

    /**
     * @return array{'socialNetworks': mixed, 'links': mixed, 'legals': mixed, 'cookiesPath': string, 'privacyPath': string, 'legalPath': string}
     */
    public function __invoke(Argument $argument): array
    {
        $socialNetworks = $this->footerSocialNetworksResolver->getFooterSocialNetworks();
        $links = $this->footerSocialNetworksResolver->getFooterLinks();
        $legals = $this->footerSocialNetworksResolver->getLegalsPages();
        $cookiesPath = $this->router->generate('app_cookies');
        $privacyPath = $this->router->generate('app_privacy');
        $legalPath = $this->router->generate('app_legal');

        return [
            'socialNetworks' => $socialNetworks,
            'links' => $links,
            'legals' => $legals,
            'cookiesPath' => $cookiesPath,
            'privacyPath' => $privacyPath,
            'legalPath' => $legalPath,
            'title' => $this->siteParameterResolver->getValue('footer.text.title'),
            'body' => $this->siteParameterResolver->getValue('footer.text.body'),
        ];
    }
}
