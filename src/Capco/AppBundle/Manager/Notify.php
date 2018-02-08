<?php

namespace Capco\AppBundle\Manager;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Resolver\UrlResolver;
use Capco\AppBundle\SiteParameter\Resolver;
use FOS\UserBundle\Model\UserInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\Router;
use Symfony\Component\Templating\EngineInterface;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Validator\Constraints\Email as EmailConstraint;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class Notify
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

    public function sendEmail($to, $fromAddress, $fromName, $body, $subject, $contentType = 'text/html')
    {
        if ($this->emailsAreValid($to, $fromAddress) && !filter_var($this->parameters['disable_delivery'], FILTER_VALIDATE_BOOLEAN)) {
            $this->mailer->send($this->generateMessage($to, $fromAddress, $fromName, $body, $subject, $contentType));

            // See https://github.com/mustafaileri/swiftmailer/commit/d289295235488cdc79473260e04e3dabd2dac3ef
            if ($this->mailer->getTransport()->isStarted()) {
                $this->mailer->getTransport()->stop();
            }
        }
    }

    // FOS User emails
    public function sendConfirmationEmailMessage(UserInterface $user)
    {
        $template = $this->parameters['confirmation.template'];
        $url = $this->router->generate('account_confirm_email', [
          'token' => $user->getConfirmationToken(),
        ], UrlGeneratorInterface::ABSOLUTE_URL);
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
                    'adminURL' => $this->urlResolver->getReportedUrl($report, true),
                ]
            );

            $this->sendEmail($to, $report->getReporter()->getEmail(), $report->getReporter()->getUsername(), $body, $subject);
        }
    }

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
                    'username' => $contribution->getAuthor()->getUsername(),
                    'trashUrl' => $this->urlResolver->getTrashedObjectUrl($contribution, true),
                ]
            );

            $this->sendEmail($contribution->getAuthor()->getEmail(), $from, $from, $body, $subject);
        }
    }

    public function notifyProposalStatusChangeInCollect(Proposal $proposal)
    {
        $fromAddress = $this->resolver->getValue('admin.mail.notifications.send_address');
        $fromName = $this->resolver->getValue('admin.mail.notifications.send_name');

        $subject = $this->translator->trans(
            'proposal_status_change_collect.notification.subject', [
                '%sitename%' => $this->resolver->getValue('global.site.fullname'),
            ], 'CapcoAppBundle'
        );
        $template = 'CapcoAppBundle:Mail:notifyProposalStatusChange.html.twig';
        $body = $this->templating->render($template, [
            'proposal' => $proposal,
        ]);

        $this->sendEmail($proposal->getAuthor()->getEmail(), $fromAddress, $fromName, $body, $subject);
        foreach ($proposal->getChildConnections() as $child) {
            $this->sendEmail($child->getAuthor()->getEmail(), $fromAddress, $fromName, $body, $subject);
        }
    }

    public function notifyProposalStatusChangeInSelection(Selection $selection)
    {
        $fromAddress = $this->resolver->getValue('admin.mail.notifications.send_address');
        $fromName = $this->resolver->getValue('admin.mail.notifications.send_name');

        $subject = $this->translator->trans(
            'proposal_status_change_selection.notification.subject', [
            '%sitename%' => $this->resolver->getValue('global.site.fullname'),
        ], 'CapcoAppBundle'
        );
        $template = 'CapcoAppBundle:Mail:notifyProposalStatusChangeInSelection.html.twig';
        $body = $this->templating->render($template, [
            'selection' => $selection,
        ]);

        $this->sendEmail($selection->getProposal()->getAuthor()->getEmail(), $fromAddress, $fromName, $body, $subject);
        foreach ($selection->getProposal()->getChildConnections() as $child) {
            $this->sendEmail($child->getAuthor()->getEmail(), $fromAddress, $fromName, $body, $subject);
        }
    }

    public function notifyProposalPost(Proposal $proposal, Post $post)
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
                'post' => $post,
            ]
        );

        $this->sendEmail($proposal->getAuthor()->getEmail(), $fromAddress, $fromName, $body, $subject);
    }

    private function generateMessage($to, $fromAddress, $fromName, $body, $subject, $contentType)
    {
        return (new \Swift_Message())
            ->setTo($to)
            ->setSubject($subject)
            ->setContentType($contentType)
            ->setBody($body)
            ->setFrom([$fromAddress => $fromName])
        ;
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
}
