<?php

namespace Capco\AppBundle\Services;

use Hip\MandrillBundle\Dispatcher;
use Hip\MandrillBundle\Message;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;

class EmailService {

    private $dispatcher;
    private $security;
    private $user;

    public function __construct(TokenStorageInterface $security, Dispatcher $dispatcher)
    {
        $this->dispatcher = $dispatcher;
        $this->security = $security;
        $this->user = $security->getToken()->getUser();
    }

    public function send($dest, $subject, $content, $expMail = null, $expName = null, $replyTo = null)
    {
        $message = new Message();
        if (null == $dest) {
            exit();
        }
        if (null != $expMail) {
            $message->setFromEmail($expMail);
        }
        if (null != $expName) {
            $message->setFromName($expName);
        }
        if (null != $replyTo) {
            $message->setReplyTo($replyTo);
        }
        $message
            ->addTo($dest)
            ->setSubject($subject)
            ->setHtml($content)
        ;

        $result = $this->dispatcher->send($message);
        return new Response('<pre' . print_r($result, true) . '</pre>');
    }
}