<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use Capco\UserBundle\Entity\User;
use FOS\UserBundle\Model\UserInterface;
use Symfony\Component\Routing\Router;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;
use FOS\UserBundle\Mailer\MailerInterface;
use Symfony\Component\Validator\Constraints\Email as EmailConstraint;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class Notify implements MailerInterface
{
    protected $mailer;
    protected $serviceMailer;
    protected $templating;
    protected $resolver;
    protected $translator;
    protected $router;
    protected $parameters;
    protected $urlResolver;
    protected $validator;

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

    private function generateMessage($to, $fromAddress, $fromName, $body, $subject, $contentType)
    {
        return \Swift_Message::newInstance()
            ->setTo($to)
            ->setSubject($subject)
            ->setContentType($contentType)
            ->setBody($body)
            ->setFrom([$fromAddress => $fromName])
        ;
    }

    public function sendInternalEmail($body, $subject, $contentType = 'text/html')
    {
        $to = $this->resolver->getValue('admin.mail.notifications.receive_address');
        $fromAdress = $this->resolver->getValue('admin.mail.notifications.send_address');
        $fromName = $this->resolver->getValue('admin.mail.notifications.send_name');
        $this->sendEmail($to, $fromAdress, $fromName, $body, $subject, $contentType);
    }

    private function emailsAreValid($to, $from)
    {
        $emailConstraint = new EmailConstraint();
        if ($this->validator->validateValue($to, $emailConstraint)->count() > 0) {
            return false;
        }
        if ($this->validator->validateValue($from, $emailConstraint)->count() > 0) {
            return false;
        }

        return true;
    }

    public function sendEmail($to, $fromAddress, $fromName, $body, $subject, $contentType = 'text/html')
    {
        if ($this->emailsAreValid($to, $fromAddress)) {
            $this->mailer->send($this->generateMessage($to, $fromAddress, $fromName, $body, $subject, $contentType));
        }
    }

    public function sendExpiredUserEmail(UserInterface $user, $contributionsDeleted)
    {
      $template = $contributionsDeleted
        ? 'CapcoAppBundle:Mail:notifyExpiredWithContributions.html.twig'
        : 'CapcoAppBundle:Mail:notifyExpiredNoContributions.html.twig'
      ;
      $subjectString = $contributionsDeleted
        ? 'email.expire_user.subject_with_contrib'
        : 'email.expire_user.subject_no_contrib'
      ;
      $subject = $this->translator->trans($subjectString, ['%sitename%' => $this->resolver->getValue('global.site.fullname')],'CapcoAppBundle');
      $url = $this->router->generate('capco_user_confirmation_email', [
        'token' => $user->getConfirmationToken()
      ], true);
      $fromAddress = $this->resolver->getValue('admin.mail.notifications.send_address');
      $fromName = $this->resolver->getValue('admin.mail.notifications.send_name');

      $rendered = $this->templating->render($template, [
        'user' => $user,
        'url' => $url,
        'email' => $this->resolver->getValue('admin.mail.notifications.receive_address'),
      ]);
      $this->sendEmail($user->getEmail(), $fromAddress, $fromName, $rendered, $subject);
    }

    // FOS User emails
    public function sendConfirmationEmailMessage(UserInterface $user)
    {
        $template = $this->parameters['confirmation.template'];
        $url = $this->router->generate('capco_user_confirmation_email', [
          'token' => $user->getConfirmationToken()
        ], true);
        $rendered = $this->templating->render($template, [
            'user' => $user,
            'confirmationUrl' => $url,
        ]);
        $this->sendFOSEmail($rendered, $user->getEmail());
    }

    public function sendResettingEmailMessage(UserInterface $user)
    {
        $template = $this->parameters['resetting.template'];
        $url = $this->router->generate('fos_user_resetting_reset', ['token' => $user->getConfirmationToken()], true);
        $rendered = $this->templating->render($template, [
            'user' => $user,
            'confirmationUrl' => $url,
        ]);
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

    /*
     * Notifications for reporting and moderation
     */

    /**
     * @param Reporting $report
     */
    public function sendNotifyMessage(Reporting $report)
    {
        $to = $this->resolver->getValue('admin.mail.notifications.receive_address');
        if ($to) {
            $subject = $this->translator->trans(
                'reporting.notification.subject',
                [
                    '%sitename%' => $this->resolver->getValue('global.site.fullname'),
                ],
                'CapcoAppBundle'
            );
            $template = 'CapcoAppBundle:Mail:notifyReporting.html.twig';
            $type = $this->translator->trans(Reporting::$statusesLabels[$report->getStatus()], [], 'CapcoAppBundle');
            $body = $this->templating->render(
                $template,
                [
                    'user' => $report->getReporter(),
                    'type' => $type,
                    'message' => $report->getBody(),
                    'contribution' => $report->getRelatedObject(),
                    'siteURL' => $this->urlResolver->getObjectUrl($report->getRelatedObject(), true),
                    'adminURL' => $this->urlResolver->getAdminObjectUrl($report->getRelatedObject(), true),
                ]
            );

            $this->sendEmail($to, $report->getReporter()->getEmail(), $report->getReporter()->getUsername(), $body, $subject);
        }
    }

    /**
     * @param $contribution
     */
    public function notifyModeration($contribution)
    {
        $from = $this->resolver->getValue('admin.mail.notifications.send_address');
        if ($from && $contribution->getAuthor()) {
            $subject = $this->translator->trans(
                'moderation.notification.subject', [], 'CapcoAppBundle'
            );
            $template = 'CapcoAppBundle:Mail:notifyModeration.html.twig';
            $body = $this->templating->render(
                $template,
                [
                    'contribution' => $contribution,
                    'trashUrl' => $this->urlResolver->getTrashedObjectUrl($contribution, true),
                ]
            );

            $this->sendEmail($contribution->getAuthor()->getEmail(), $from, $from, $body, $subject);
        }
    }

    /**
     * @param $contribution
     */
    public function notifyProposalDeletion($contribution)
    {
        if ($contribution) {
            $subject = $this->translator->trans(
                'proposal_deletion.notification.subject', [], 'CapcoAppBundle'
            );
            $template = 'CapcoAppBundle:Mail:notifyProposalDeletion.html.twig';
            $body = $this->templating->render(
                $template,
                [
                    'contribution' => $contribution,
                ]
            );

            $this->sendInternalEmail($body, $subject);
        }
    }

    /**
     * @param Proposal $proposal
     */
    public function notifyProposalStatusChange(Proposal $proposal)
    {
        $fromAddress = $this->resolver->getValue('admin.mail.notifications.send_address');
        $fromName = $this->resolver->getValue('admin.mail.notifications.send_name');

        $subject = $this->translator->trans(
            'proposal_status_change.notification.subject', [
                '%sitename%' => $this->resolver->getValue('global.site.fullname'),
            ], 'CapcoAppBundle'
        );
        $template = 'CapcoAppBundle:Mail:notifyProposalStatusChange.html.twig';
        $body = $this->templating->render(
            $template,
            [
                'proposal' => $proposal,
            ]
        );

        $this->sendEmail($proposal->getAuthor()->getEmail(), $fromAddress, $fromName, $body, $subject);
    }

    /**
     * @param Proposal $proposal
     */
    public function notifyProposalAnswer(Proposal $proposal)
    {
        $fromAddress = $this->resolver->getValue('admin.mail.notifications.send_address');
        $fromName = $this->resolver->getValue('admin.mail.notifications.send_name');

        $subject = $this->translator->trans(
            'proposal_answer.notification.subject', [
            '%sitename%' => $this->resolver->getValue('global.site.fullname'),
        ], 'CapcoAppBundle'
        );
        $template = 'CapcoAppBundle:Mail:notifyProposalAnswer.html.twig';
        $body = $this->templating->render(
            $template,
            [
                'proposal' => $proposal,
            ]
        );

        $this->sendEmail($proposal->getAuthor()->getEmail(), $fromAddress, $fromName, $body, $subject);
    }
}
