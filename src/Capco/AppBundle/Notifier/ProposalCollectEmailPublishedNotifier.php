<?php

namespace Capco\AppBundle\Notifier;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\GraphQL\Resolver\Proposal\ProposalUrlResolver;
use Capco\AppBundle\Mailer\MailerService;
use Capco\AppBundle\Mailer\Message\Proposal\ProposalCollectEmailPublishedMessage;
use Capco\AppBundle\Resolver\LocaleResolver;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\Routing\RouterInterface;

class ProposalCollectEmailPublishedNotifier extends BaseNotifier
{
    public function __construct(
        MailerService $mailer,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        LocaleResolver $localeResolver,
        private readonly ProposalUrlResolver $proposalUrlResolver
    ) {
        parent::__construct($mailer, $siteParams, $router, $localeResolver);
    }

    public function onPublish(Proposal $proposal): void
    {
        $confirmationUrl = $this->router->generate('app_proposal_consent_internal_communication', ['token' => $proposal->getConsentInternalCommunicationToken()], RouterInterface::ABSOLUTE_URL);
        $proposalUrl = $this->proposalUrlResolver->__invoke($proposal);

        $formatter = new \IntlDateFormatter(
            'fr_FR',
            \IntlDateFormatter::LONG,
            \IntlDateFormatter::SHORT
        );
        $formatter->setPattern('d MMMM y à HH\'h\'mm');

        $publishedAt = $formatter->format($proposal->getPublishedAt());

        $this->mailer->createAndSendMessage(
            ProposalCollectEmailPublishedMessage::class,
            $proposal,
            [
                'baseUrl' => $this->getBaseUrl(),
                'siteName' => $this->getSiteName(),
                'confirmationUrl' => $confirmationUrl,
                'proposalUrl' => $proposalUrl,
                'publishedAt' => $publishedAt,
            ],
            $proposal->getAuthor()
        );
    }
}
