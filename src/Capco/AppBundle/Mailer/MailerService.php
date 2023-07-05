<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Entity\ActionToken;
use Capco\AppBundle\Mailer\Message\AbstractMessage;
use Capco\AppBundle\Mailer\Message\MessageRecipient;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

class MailerService extends MailerFactory
{
    protected \Swift_Mailer $mailer;
    protected Environment $templating;
    protected TokenManager $tokenManager;
    protected array $failedRecipients;

    public function __construct(
        \Swift_Mailer $mailer,
        Environment $templating,
        TranslatorInterface $translator,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        SenderEmailResolver $senderEmailResolver,
        TokenManager $tokenManager
    ) {
        parent::__construct($translator, $siteParams, $router, $senderEmailResolver);
        $this->mailer = $mailer;
        $this->templating = $templating;
        $this->tokenManager = $tokenManager;
        $this->failedRecipients = [];
    }

    public function createAndSendMessage(
        string $type,
        $element,
        array $params = [],
        ?User $recipient = null,
        ?string $recipientEmail = null,
        ?string $replyTo = null
    ): bool {
        if ($recipient && $recipient->getId()) {
            $params['unsubscribeUrl'] = $this->getUnsubscribeUrl($recipient);
        }
        $params['locale'] =
            $recipient && $recipient->getLocale()
                ? $recipient->getLocale()
                : $this->siteParams->getDefaultLocale();

        $message = $this->createMessage(
            $type,
            $element,
            $params,
            $recipient,
            $recipientEmail,
            $replyTo
        );

        return $this->sendMessage($message);
    }

    public function sendMessage(AbstractMessage $message): bool
    {
        $delivered = true;
        $this->configureMessage($message);
        $swiftMessage = self::generateEmptySwiftMessage($message);
        $localizedParts = [];
        foreach ($message->getRecipients() as $recipient) {
            $locale = $recipient->getLocale() ?: $this->siteParams->getDefaultLocale();
            $this->cacheLocalizedPartsIfNotYet($localizedParts, $message, $locale);
            $swiftMessage
                ->setSubject($localizedParts[$locale]['subject'])
                ->setBody($localizedParts[$locale]['body'])
            ;
            $this->sendSwiftMessageToRecipient($swiftMessage, $recipient);
        }

        return $delivered;
    }

    public function getFailedRecipients(): array
    {
        return $this->failedRecipients;
    }

    public function getMailerTransport(): \Swift_Transport
    {
        return $this->mailer->getTransport();
    }

    private function configureMessage(AbstractMessage $message): AbstractMessage
    {
        if (!$message->getSenderEmail()) {
            $this->setDefaultSender($message);
        }

        return $message;
    }

    private static function generateEmptySwiftMessage(AbstractMessage $message): \Swift_Message
    {
        $swiftMessage = new \Swift_Message();
        $swiftMessage->setContentType('text/html')->setFrom([
            $message->getSenderEmail() => $message->getSenderName(),
        ]);

        if (!empty($message->getBcc())) {
            $swiftMessage->setBcc($message->getBcc());
        }
        if (!empty($message->getCC())) {
            $swiftMessage->setCc($message->getCC());
        }
        if (!empty($message->getReplyTo())) {
            // We don't want to keep name.
            $swiftMessage->setReplyTo([$message->getReplyTo() => null]);
        }

        return $swiftMessage;
    }

    private function generateLocalizedSubjectFromMessage(
        AbstractMessage $message,
        string $locale
    ): string {
        return $this->translator->trans(
            $message->getSubject(),
            $message->getSubjectVars(),
            'CapcoAppBundle',
            $locale
        );
    }

    private function generateLocalizedBodyFromMessage(
        AbstractMessage $message,
        string $locale
    ): string {
        $templateVars = $message->getTemplateVars();
        $templateVars['user_locale'] = $locale;
        if ($this->isTwigTemplate($message->getTemplate())) {
            $body = $this->templating->render($message->getTemplate(), $templateVars);
        } else {
            $body = $this->translator->trans(
                $message->getTemplate(),
                $templateVars,
                'CapcoAppBundle',
                $locale
            );
        }
        if ($message->getFooterTemplate()) {
            $footerVars = $message->getFooterVars();
            $footerVars['user_locale'] = $locale;
            if ($this->isTwigTemplate($message->getFooterTemplate())) {
                $body .= $this->templating->render($message->getFooterTemplate(), $footerVars);
            } else {
                $body .= $this->translator->trans(
                    $message->getFooterTemplate(),
                    $message->getFooterVars(),
                    'CapcoAppBundle',
                    $locale
                );
            }
        }

        return $body;
    }

    private function sendSwiftMessageToRecipient(
        \Swift_Message $swiftMessage,
        MessageRecipient $recipient
    ): void {
        $swiftMessage->setTo([$recipient->getEmailAddress() => $recipient->getFullName()]);
        $this->mailer->send($swiftMessage, $this->failedRecipients); //todo not translated if not twig
        // See https://github.com/mustafaileri/swiftmailer/commit/d289295235488cdc79473260e04e3dabd2dac3ef
        if ($this->mailer->getTransport()->isStarted()) {
            $this->mailer->getTransport()->stop();
        }
    }

    private function cacheLocalizedPartsIfNotYet(
        array &$localizedParts,
        AbstractMessage $message,
        string $locale
    ): void {
        if (!isset($localizedParts[$locale])) {
            $localizedParts[$locale] = [
                'body' => $this->generateLocalizedBodyFromMessage($message, $locale),
                'subject' => $this->generateLocalizedSubjectFromMessage($message, $locale),
            ];
        }
    }

    private function isTwigTemplate(string $template): bool
    {
        return strpos($template, '.twig');
    }

    private function getUnsubscribeUrl(User $recipient): string
    {
        return $this->router->generate(
            'capco_app_action_token',
            [
                'token' => $this->tokenManager
                    ->getOrCreateActionToken($recipient, ActionToken::UNSUBSCRIBE)
                    ->getToken(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
