<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Mailer\Message\Message;
use Capco\AppBundle\Mailer\Message\User\ContactMessage;
use Capco\AppBundle\SiteParameter\Resolver;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;

class MailerService
{
    protected $mailer;
    protected $templating;
    protected $translator;
    protected $siteParams;
    protected $router;
    protected $failedRecipients;

    public function __construct(
        \Swift_Mailer $mailer,
        EngineInterface $templating,
        TranslatorInterface $translator,
        Resolver $siteParams,
        Router $router
    ) {
        $this->mailer = $mailer;
        $this->templating = $templating;
        $this->translator = $translator;
        $this->siteParams = $siteParams;
        $this->router = $router;
        $this->failedRecipients = [];
    }

    public function sendMessage(Message $message): bool
    {
        $delivered = true;

        // ReplyTo's header is used in Contact's context because we want to keep platform's sender but
        // deliver as final user (eg: from: sender@cap-collectif.com in API but show in mailbox from: user@gmail.com)
        if ($message instanceof ContactMessage) {
            $message->setReplyTo($message->getSenderEmail());
            // this trigger next condition below.
            $message->setSenderEmail(null);
        }

        if (!$message->getSenderEmail()) {
            $this->setDefaultSender($message);
        }

        $message->setSitename($this->siteParams->getValue('global.site.fullname'));
        $message->setSiteUrl(
            $this->router->generate('app_homepage', [], UrlGeneratorInterface::ABSOLUTE_URL)
        );

        $subject = $this->translator->trans(
            $message->getSubject(),
            $message->getSubjectVars(),
            'CapcoAppBundle'
        );

        $template = $message->getTemplate();
        if (false !== strpos($template, '.twig')) {
            $body = $this->templating->render($message->getTemplate(), $message->getTemplateVars());
        } else {
            $body = $this->translator->trans(
                $template,
                $message->getTemplateVars(),
                'CapcoAppBundle'
            );
        }
        if ($message->getFooterTemplate()) {
            if (false !== strpos($message->getFooterTemplate(), '.twig')) {
                $body .= $this->templating->render(
                    $message->getFooterTemplate(),
                    $message->getFooterVars()
                );
            } else {
                $body .= $this->translator->trans(
                    $message->getFooterTemplate(),
                    $message->getFooterVars(),
                    'CapcoAppBundle'
                );
            }
        }
        $swiftMessage = (new \Swift_Message())
            ->setSubject($subject)
            ->setContentType('text/html')
            ->setBody($body)
            ->setFrom([
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

        //  try {
        foreach ($message->getRecipients() as $recipient) {
            $swiftMessage->setTo([$recipient->getEmailAddress() => $recipient->getFullName()]);
            $this->mailer->send($swiftMessage, $this->failedRecipients);
            // See https://github.com/mustafaileri/swiftmailer/commit/d289295235488cdc79473260e04e3dabd2dac3ef
            if ($this->mailer->getTransport()->isStarted()) {
                $this->mailer->getTransport()->stop();
            }
        }
        //} //catch (\Exception $exception) {
        //    $delivered = false;
        //}

        return $delivered;
    }

    public function getFailedRecipients()
    {
        return $this->failedRecipients;
    }

    private function setDefaultSender(Message $message): void
    {
        $senderEmail = $this->siteParams->getValue('admin.mail.notifications.send_address');
        $senderName = $this->siteParams->getValue('admin.mail.notifications.send_name');
        $message->setSenderEmail($senderEmail);
        $message->setSenderName($senderName);
    }
}
