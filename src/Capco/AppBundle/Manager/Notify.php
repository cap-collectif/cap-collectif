<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Services\EmailService;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\User;
use Sonata\NotificationBundle\Model\Message;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;

class Notify
{
    protected $mailer;
    protected $templating;
    protected $resolver;
    protected $translator;

    public function __construct(\Swift_Mailer $mailer, EngineInterface $templating, TranslatorInterface $translator, Resolver $resolver)
    {
        $this->mailer = $mailer;
        $this->templating = $templating;
        $this->resolver = $resolver;
        $this->translator = $translator;
    }
    
    public function sendNotifyMessage(User $user, $type, $message)
    {
        $to = $this->resolver->getValue('admin.mail.notifications');
        $subject = $this->translator->trans('reporting.notification.subject', array(
                '%sitename%' => $this->resolver->getValue('global.site.fullname'),
            ),
            'CapcoAppBundle'
        );
        $template = 'CapcoAppBundle:Mail:notify.html.twig';
        $type = $this->translator->trans(Reporting::$statusesLabels[$type], array(), 'CapcoAppBundle');
        $body = $this->templating->render($template, array('user' => $user, 'type' => $type, 'message' => $message));
        $fromMail = $user->getEmail();
        $message = \Swift_Message::newInstance()
            ->setTo($to)
            ->setSubject($subject)
            ->setContentType('text/html')
            ->setBody($body)
            ->setFrom($fromMail)
        ;
        $this->mailer->send($message);
    }
}
