<?php

namespace Capco\AppBundle\GraphQL\Resolver\Emailing;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\EmailingCampaignMessage;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Twig\Environment;

class EmailingCampaignPreviewResolver implements QueryInterface
{
    public function __construct(private readonly SiteParameterResolver $siteParams, private readonly RouterInterface $router, private readonly Environment $twig)
    {
    }

    /**
     * @todo set user_locale to localize the campaign
     */
    public function __invoke(mixed $campaign): string
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
