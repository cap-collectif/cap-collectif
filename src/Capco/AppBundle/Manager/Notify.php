<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Templating\EngineInterface;

class Notify
{
    protected $mailer;
    protected $templating;
    protected $resolver;

    public function __construct(\Swift_Mailer $mailer, EngineInterface $templating, Resolver $resolver)
    {
        $this->mailer = $mailer;
        $this->templating = $templating;
        $this->resolver = $resolver;
    }

    //TODO Update Link mail
    public function sendNotifyMessage(User $user, $message){
        $subject = "Un contenu à été signalé";
        $template = 'CapcoAppBundle:Mail:notify.txt.twig';
        $from = $user->getEmail();
        $to = $this->resolver->getValue('admin.mail.notifications');
        $body = $this->templating->render($template, array('user' => $user, 'message' => $message));
        $this->sendMessage($from, $to, $subject, $body);
    }

    protected function sendMessage($from, $to, $subject, $body)
    {
        $mail = \Swift_Message::newInstance();

        $mail
            ->setFrom($from)
            ->setTo($to)
            ->setSubject($subject)
            ->setBody($body)
            ->setContentType('text/html');

            $this->mailer->send($mail);
    }
}
