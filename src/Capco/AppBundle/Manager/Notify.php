<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\User;
use FOS\UserBundle\Model\UserInterface;
use Symfony\Component\Routing\Router;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;
use FOS\UserBundle\Mailer\MailerInterface;

class Notify implements MailerInterface
{
    protected $mailer;
    protected $templating;
    protected $resolver;
    protected $translator;
    protected $router;
    protected $parameters;

    public function __construct(\Swift_Mailer $mailer, EngineInterface $templating, TranslatorInterface $translator, Resolver $resolver, Router $router, array $parameters)
    {
        $this->mailer = $mailer;
        $this->templating = $templating;
        $this->resolver = $resolver;
        $this->translator = $translator;
        $this->router = $router;
        $this->parameters = $parameters;
    }

    public function sendEmail($to, $fromAddress, $fromName, $body, $subject, $contentType = 'text/html')
    {
        if ($to && $fromAddress) {
            $message = \Swift_Message::newInstance()
                ->setTo($to)
                ->setSubject($subject)
                ->setContentType($contentType)
                ->setBody($body)
                ->setFrom([$fromAddress => $fromName]);
            $this->mailer->send($message);
        }
    }

    // FOS User emails

    public function sendConfirmationEmailMessage(UserInterface $user)
    {
        $template = $this->parameters['confirmation.template'];
        $url = $this->router->generate('fos_user_registration_confirm', array('token' => $user->getConfirmationToken()), true);
        $rendered = $this->templating->render($template, array(
            'user' => $user,
            'confirmationUrl' =>  $url,
        ));
        $this->sendFOSEmail($rendered, $user->getEmail());
    }

    public function sendResettingEmailMessage(UserInterface $user)
    {
        $template = $this->parameters['resetting.template'];
        $url = $this->router->generate('fos_user_resetting_reset', array('token' => $user->getConfirmationToken()), true);
        $rendered = $this->templating->render($template, array(
            'user' => $user,
            'confirmationUrl' => $url,
        ));
        $this->sendFOSEmail($rendered, $user->getEmail());
    }

    // Code from FOSUserBundle
    public function sendFOSEmail($renderedTemplate, $toEmail)
    {
        $renderedLines = explode("\n", trim($renderedTemplate));
        $subject = $renderedLines[0];
        $body = implode("\n", array_slice($renderedLines, 1));

        $fromEmail = $this->resolver->getValue('admin.mail.notifications.send_address');
        $fromName = $this->resolver->getValue('admin.mail.notifications.send_name');

        if (!$fromEmail) {
            $fromEmail = 'assistance@cap-collectif.com';
        }

        if (!$fromName) {
            $fromName = 'Cap Collectif';
        }

        $this->sendEmail($toEmail, $fromEmail, $fromName, $body, $subject);
    }

    // Notifications to admin emails (reporting)

    public function sendNotifyMessage(User $user, $type, $message)
    {
        $to = $this->resolver->getValue('admin.mail.notifications.receive_address');
        if ($to) {
            $subject = $this->translator->trans(
                'reporting.notification.subject',
                array(
                    '%sitename%' => $this->resolver->getValue('global.site.fullname'),
                ),
                'CapcoAppBundle'
            );
            $template = 'CapcoAppBundle:Mail:notify.html.twig';
            $type = $this->translator->trans(Reporting::$statusesLabels[$type], array(), 'CapcoAppBundle');
            $body = $this->templating->render(
                $template,
                array('user' => $user, 'type' => $type, 'message' => $message)
            );

            $this->sendEmail($to, $user->getEmail(), $user->getUsername(), $body, $subject);
        }
    }
}
