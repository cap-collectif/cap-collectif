<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Mailer\Message\Message;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;

class MailerService
{
    protected $mailer;
    protected $templating;
    protected $translator;

    public function __construct(\Swift_Mailer $mailer, EngineInterface $templating, TranslatorInterface $translator)
    {
        $this->mailer = $mailer;
        $this->templating = $templating;
        $this->translator = $translator;
    }

    public function sendMessage(Message $message): bool
    {
        $delivered = true;
        $subject = $this->translator->trans($message->getSubject(), $message->getSubjectVars(), 'CapcoAppBundle');

        $template = $message->getTemplate();
        $body = '';
        if (false !== strpos($template, '.twig')) {
            $body = $this->templating->render(
              $message->getTemplate(),
              $message->getTemplateVars()
          );
        } else {
            $body = $this->translator->trans($template, $message->getTemplateVars(), 'CapcoAppBundle');
        }

        //  try {
        foreach ($message->getRecipients() as $recipient) {
            $swiftMessage = (new \Swift_Message())
                ->setTo($recipient->getEmailAddress())
                ->setSubject($subject)
                ->setContentType('text/html')
                ->setBody($body)
                ->setFrom([
                  $message->getSenderEmail() => $message->getSenderName(),
                ])
            ;
            $this->mailer->send($swiftMessage);
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
}
