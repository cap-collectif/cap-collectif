<?php

namespace Capco\AppBundle\Mailer;

use Capco\AppBundle\Mailer\Message\AbstractAdminMessage;
use Capco\AppBundle\Mailer\Message\AbstractExternalMessage;
use Capco\AppBundle\Mailer\Message\AbstractMessage;
use Capco\AppBundle\Mailer\Message\AbstractModeratorMessage;
use Capco\AppBundle\Mailer\Message\EmailingCampaign\AbstractEmailingCampaignMessage;
use Capco\AppBundle\Mailer\Message\Reporting\ReportingCreateMessage;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class MailerFactory
{
    protected TranslatorInterface $translator;
    protected SiteParameterResolver $siteParams;
    protected RouterInterface $router;
    protected SenderEmailResolver $senderEmailResolver;

    public function __construct(
        TranslatorInterface $translator,
        SiteParameterResolver $siteParams,
        RouterInterface $router,
        SenderEmailResolver $senderEmailResolver
    ) {
        $this->translator = $translator;
        $this->siteParams = $siteParams;
        $this->router = $router;
        $this->senderEmailResolver = $senderEmailResolver;
    }

    public function createMessage(
        string $type,
        $element,
        array $params,
        ?User $recipient = null,
        ?string $recipientEmail = null,
        ?string $replyTo = null
    ): AbstractMessage {
        $subType = self::getMessageTypeFromClass($type);

        $this->addNameAndURLToParams($params);
        if (AbstractModeratorMessage::class === $subType) {
            $params['translator'] = $this->translator;
        }

        if (null === $recipientEmail) {
            $recipientEmail = $recipient
                ? $recipient->getEmail()
                : $this->siteParams->getValue('admin.mail.notifications.receive_address');
        }

        /** @var AbstractMessage $message */
        $message = new $type(
            $recipientEmail,
            \constant("{$type}::SUBJECT"),
            \call_user_func("{$type}::getMySubjectVars", $element, $params),
            \constant("{$type}::TEMPLATE"),
            \call_user_func("{$type}::getMyTemplateVars", $element, $params),
            $recipient,
            $replyTo
        );

        self::setFooter($message, $type, $recipientEmail, $params);
        $message->setSitename($params['siteName']);
        $message->setSiteUrl($params['siteURL']);

        if (
            AbstractModeratorMessage::class === $subType
            && ReportingCreateMessage::class !== $type
        ) {
            $this->setModerationLinks($message, $element);
        }

        $this->copyToAdminIfNeeded($message, $params);

        return $message;
    }

    protected function setDefaultSender(AbstractMessage $message): void
    {
        $senderEmail = $this->senderEmailResolver->__invoke();
        $senderName = $this->siteParams->getValue('admin.mail.notifications.send_name');
        $message->setSenderEmail($senderEmail);
        $message->setSenderName($senderName);
    }

    private function addNameAndURLToParams(array &$params): void
    {
        $params['siteName'] = $this->siteParams->getValue('global.site.fullname');
        $params['siteURL'] = $this->router->generate(
            'app_homepage',
            ['_locale' => $params['locale']],
            RouterInterface::ABSOLUTE_URL
        );
        $params['baseURL'] = $this->router->generate(
            'app_homepage',
            [],
            RouterInterface::ABSOLUTE_URL
        );
    }

    private static function setFooter(
        AbstractMessage $message,
        string $type,
        string $email,
        array $params
    ): void {
        $footer = \constant("{$type}::FOOTER"); //twig or trad key
        $footerVars = \call_user_func(
            "{$type}::getMyFooterVars",
            $email,
            $params['siteName'],
            $params['baseURL']
        );
        $message->setFooterTemplate($footer);
        $message->setFooterTemplateVars($footerVars);
    }

    private static function getMessageTypeFromClass(string $class): string
    {
        if (\in_array(AbstractModeratorMessage::class, class_parents($class))) {
            return AbstractModeratorMessage::class;
        }
        if (\in_array(AbstractExternalMessage::class, class_parents($class))) {
            return AbstractExternalMessage::class;
        }
        if (\in_array(AbstractAdminMessage::class, class_parents($class))) {
            return AbstractAdminMessage::class;
        }
        if (\in_array(AbstractEmailingCampaignMessage::class, class_parents($class))) {
            return AbstractEmailingCampaignMessage::class;
        }

        throw new MailerException("{$class} is not an known type of message");
    }

    private function setModerationLinks(AbstractModeratorMessage $message, $moderable): void
    {
        $moderationLinks = [
            '{moderateSexualLink}' => $this->router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'reporting.status.sexual',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            '{moderateOffendingLink}' => $this->router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'reporting.status.offending',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            '{moderateInfringementLink}' => $this->router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'infringement-of-rights',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            '{moderateSpamLink}' => $this->router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'reporting.status.spam',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            '{moderateOffTopicLink}' => $this->router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'reporting.status.off_topic',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
            '{moderateGuidelineViolationLink}' => $this->router->generate(
                'moderate_contribution',
                [
                    'token' => $moderable->getModerationToken(),
                    'reason' => 'moderation-guideline-violation',
                ],
                RouterInterface::ABSOLUTE_URL
            ),
        ];
        $message->setModerationLinks($moderationLinks);
    }

    private function copyToAdminIfNeeded(AbstractMessage $message, array $params): void
    {
        if (isset($params['copyToAdmin']) && $params['copyToAdmin']) {
            $message->addBcc(
                $this->siteParams->getValue('admin.mail.notifications.receive_address')
            );
        }
    }
}
