<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Mailer\Message\NewOpinionModeratorMessage;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use FOS\UserBundle\Mailer\MailerInterface;
use FOS\UserBundle\Model\UserInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Validator\Constraints\Email as EmailConstraint;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class OpinionNotifier implements MailerInterface
{
    protected $mailer;
    protected $templating;
    protected $translator;
    protected $router;
    protected $parameters;
    protected $urlResolver;
    protected $validator;
    protected $logger;

    public function __construct(\Swift_Mailer $mailer, EngineInterface $templating, TranslatorInterface $translator, Resolver $resolver, Router $router, UrlResolver $urlResolver, ValidatorInterface $validator, array $parameters)
    {
        $this->mailer = $mailer;
        $this->templating = $templating;
        $this->resolver = $resolver;
        $this->translator = $translator;
        $this->router = $router;
        $this->urlResolver = $urlResolver;
        $this->validator = $validator;
        $this->parameters = $parameters;
    }

    // public function sendEmail($to, $fromAddress, $fromName, $body, $subject, $contentType = 'text/html')
    // {
    //     if ($this->emailsAreValid($to, $fromAddress) && !filter_var($this->parameters['disable_delivery'], FILTER_VALIDATE_BOOLEAN)) {
    //         $this->mailer->send($this->generateMessage($to, $fromAddress, $fromName, $body, $subject, $contentType));
    //
    //         // See https://github.com/mustafaileri/swiftmailer/commit/d289295235488cdc79473260e04e3dabd2dac3ef
    //         if ($this->mailer->getTransport()->isStarted()) {
    //             $this->mailer->getTransport()->stop();
    //         }
    //     }
    // }

    public function onCreation(UserInterface $user)
    {
        $this->mailer->sendMessage(NewOpinionModeratorMessage::create(
          $opinion,
          $this->resolver->getValue('admin.mail.notifications.send_address'),
          $this->resolver->getValue('admin.mail.notifications.send_name'),
          ('capco.resolver.consultations')->resolvePropositionUrl($opinion),
          ('capco.resolver.user')->resolveUrl($opinion->getAuthor())
      ));

        //     $rendered = $this->templating->render('CapcoAppBundle:Mail:confirmAdminAccount.html.twig', [
    //         'user' => $user,
    //         'sitename' => $sitename,
    //         'confirmationUrl' => $url,
    //     ]);
    //     $this->sendEmail($user->getEmail(), $fromAddress, 'Cap Collectif', $rendered, 'Votre inscription sur ' . $sitename);
    // }
    //     $template = $this->parameters['resetting.template'];
    //     $url = $this->router->generate('fos_user_resetting_reset', ['token' => $user->getConfirmationToken()], UrlGeneratorInterface::ABSOLUTE_URL);
    //     $rendered = $this->templating->render($template, [
    //         'user' => $user,
    //         'confirmationUrl' => $url,
    //     ]);
    //     $this->sendFOSEmail($rendered, $user->getEmail());
    }

    // private function emailsAreValid($to, $from)
    // {
    //     $emailConstraint = new EmailConstraint();
    //     if ($this->validator->validateValue($to, $emailConstraint)->count() > 0) {
    //         return false;
    //     }
    //     if ($this->validator->validateValue($from, $emailConstraint)->count() > 0) {
    //         return false;
    //     }
    //
    //     return true;
    // }
}
