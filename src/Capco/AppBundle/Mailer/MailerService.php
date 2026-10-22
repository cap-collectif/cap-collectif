<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Entity\ActionToken;
use Capco\AppBundle\Entity\Interfaces\ContributorInterface;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Mailer\Message\AbstractMessage;
use Capco\AppBundle\Mailer\Message\MessageRecipient;
use Capco\AppBundle\Manager\TokenManager;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Twig\Environment;

class MailerService extends MailerFactory
{
    public function __construct(
        protected MailerInterface $mailer,
        protected Environment $templating,
        TranslatorInterface $translator,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        SenderEmailResolver $senderEmailResolver,
        protected TokenManager $tokenManager
    ) {
        parent::__construct($translator, $siteParams, $router, $senderEmailResolver);
    }

    public function createAndSendMessage(
        string $type,
        $element,
        array $params = [],
        ?ContributorInterface $recipient = null,
        ?string $recipientEmail = null,
        ?string $replyTo = null
    ): bool {
        if ($recipient instanceof User && $recipient->getId()) {
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
        $this->configureMessage($message);
        $mailerMessage = self::generateEmptyMessage($message);
        $localizedParts = [];
        foreach ($message->getRecipients() as $recipient) {
            $locale = $recipient->getLocale() ?: $this->siteParams->getDefaultLocale();
            $this->cacheLocalizedPartsIfNotYet($localizedParts, $message, $locale);
            $mailerMessage
                ->subject($localizedParts[$locale]['subject'])
                ->html($localizedParts[$locale]['body'])
            ;
            $this->sendMessageToRecipient($mailerMessage, $recipient);
        }

        return true;
    }

    private function configureMessage(AbstractMessage $message): AbstractMessage
    {
        if (!$message->getSenderEmail()) {
            $this->setDefaultSender($message);
        }

        return $message;
    }

    private static function generateEmptyMessage(AbstractMessage $message): Email
    {
        $email = (new Email())
            ->html('')
            ->from(new Address($message->getSenderEmail(), $message->getSenderName() ?? ''))
        ;

        if (!empty($message->getBcc())) {
            $email->bcc(...$message->getBcc());
        }

        if (!empty($message->getCC())) {
            $email->cc(...$message->getCC());
        }

        if (!empty($message->getReplyTo())) {
            $email->replyTo($message->getReplyTo());
        }

        return $email;
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

    /**
     * @throws TransportExceptionInterface
     */
    private function sendMessageToRecipient(
        Email $email,
        MessageRecipient $recipient
    ): void {
        $email->to(new Address($recipient->getEmailAddress(), $recipient->getFullName() ?? ''));
        $this->mailer->send($email);
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

    /** @param Participant|User $recipient */
    private function getUnsubscribeUrl($recipient): string
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
