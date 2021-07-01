<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\EmailingCampaignMessage;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Twig\Environment;

class EmailingCampaignPreviewResolver implements ResolverInterface
{
    private SiteParameterResolver $siteParams;
    private RouterInterface $router;
    private Environment $twig;

    public function __construct(
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        Environment $twig
    ) {
        $this->siteParams = $siteParams;
        $this->router = $router;
        $this->twig = $twig;
    }

    /**
     * @todo set user_locale to localize the campaign
     */
    public function __invoke($campaign): string
    {
        return $this->twig->render(EmailingCampaignMessage::TEMPLATE, [
            'baseUrl' => $this->router->generate(
                'app_homepage',
                [],
                UrlGeneratorInterface::ABSOLUTE_URL
            ),
            'siteUrl' => $this->router->generate(
                'app_homepage',
                [],
                UrlGeneratorInterface::ABSOLUTE_URL
            ),
            'siteName' => $this->siteParams->getValue('global.site.fullname'),
            'unsubscribeUrl' => '#',
            'user_locale' => '',
            'content' => self::getContentFromData($campaign),
        ]);
    }

    private static function getContentFromData($campaign): string
    {
        return $campaign instanceof EmailingCampaign
            ? $campaign->getContent()
            : $campaign['content'];
    }
}
