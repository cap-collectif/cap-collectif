<?php

namespace Capco\AppBundle\Mailer\Recipient;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Mailer\Enum\RecipientType;
use Capco\AppBundle\Mailer\Model\EmailCampaignRecipient;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * Unsubscribe routes are generated on first use so service initialization does not require a database.
 * The URLs are then reused with recipient placeholders to avoid generating routes for every message.
 */
class MessageBuilder
{
    private ?string $unsubscribeUserBaseUrl = null;
    private ?string $unsubscribeParticipantBaseUrl = null;

    public function __construct(
        private readonly TranslatorInterface $translator,
        private readonly UrlGeneratorInterface $router,
    ) {
    }

    // We ignore missingType.iterableValue because the messages structure depends on the MailJet API
    // @phpstan-ignore missingType.iterableValue
    public function buildOneMessage(
        EmailingCampaign $emailingCampaign,
        EmailCampaignRecipient $recipientFromPage,
        string $htmlPart,
        string $siteName,
        string $siteUrl,
    ): array {
        $token = match ($recipientFromPage->getType()) {
            RecipientType::User => $recipientFromPage->getActionToken(),
            default => $recipientFromPage->getToken(),
        };

        return [
            'To' => [
                [
                    'Email' => $recipientFromPage->getEmail(),
                    'Name' => $recipientFromPage->getUsername(),
                ],
            ],
            'HTMLPart' => $htmlPart,
            'TextPart' => $emailingCampaign->getContent(),
            'TemplateLanguage' => true,
            'Variables' => [
                'unsubscribePart' => str_replace(
                    search: '_UNSUBSCRIBE_URL_',
                    replace: $this->getUnsubscribeBaseUrl($recipientFromPage, $token),
                    subject: $this->translateUnsubscribePart($recipientFromPage->getLocale())
                ),
                'subscribedPart' => $this->translateSubscribedPart(
                    $recipientFromPage->getLocale(),
                    $siteName,
                    $siteUrl
                ),
                'signaturePart' => $this->translateSignaturePart($recipientFromPage->getLocale()),
            ],
        ];
    }

    private function initRoutes(): void
    {
        if (null !== $this->unsubscribeUserBaseUrl && null !== $this->unsubscribeParticipantBaseUrl) {
            return;
        }

        $userBaseUrl = $this->router->generate(
            name: 'capco_app_action_token',
            parameters: ['token' => '_UNSUBSCRIBE_TOKEN_'],
            referenceType: UrlGeneratorInterface::ABSOLUTE_URL
        );

        $participantBaseUrl = $this->router->generate(
            name: 'capco_app_unsubscribe_anonymous',
            parameters: ['token' => '_UNSUBSCRIBE_TOKEN_', 'email' => '_EMAIL_'],
            referenceType: UrlGeneratorInterface::ABSOLUTE_URL
        );

        $this->unsubscribeUserBaseUrl = $userBaseUrl;
        $this->unsubscribeParticipantBaseUrl = $participantBaseUrl;
    }

    private function translateUnsubscribePart(?string $locale): string
    {
        return $this->translator->trans(
            id: 'click-here-to-unsubscribe',
            parameters: ['unsubscribeUrl' => '_UNSUBSCRIBE_URL_'],
            domain: 'CapcoAppBundle',
            locale: $locale
        );
    }

    private function translateSubscribedPart(
        ?string $locale,
        string $siteName,
        string $siteUrl
    ): string {
        return $this->translator->trans(
            id: 'email.notification.footer.subscribe.to',
            parameters: [
                'siteName' => $siteName,
                'siteUrl' => $siteUrl,
            ],
            domain: 'CapcoAppBundle',
            locale: $locale
        );
    }

    /**
     * The logo URL comes from the mailjet back-office, we uploaded our Logo there.
     */
    private function translateSignaturePart(?string $locale): string
    {
        return $this->translator->trans(
            id: 'email.propulsed.by.capco',
            parameters: [
                'logoUrl' => 'https://9wqz.mjt.lu/img2/9wqz/ad193f22-579b-4a54-bbb8-2b0f30d040b2/content',
            ],
            domain: 'CapcoAppBundle',
            locale: $locale
        );
    }

    private function getUnsubscribeBaseUrl(
        EmailCampaignRecipient $recipient,
        ?string $unsubscribeToken
    ): string {
        $this->initRoutes();

        if (RecipientType::User === $recipient->getType()) {
            $baseUrl = $this->unsubscribeUserBaseUrl;
        } else {
            $baseUrl = $this->unsubscribeParticipantBaseUrl;
        }

        return str_replace(
            search: [
                '_UNSUBSCRIBE_TOKEN_',
                '_EMAIL_',
            ],
            replace: [
                $unsubscribeToken,
                rawurlencode($recipient->getEmail()),
            ],
            subject: $baseUrl
        );
    }
}
