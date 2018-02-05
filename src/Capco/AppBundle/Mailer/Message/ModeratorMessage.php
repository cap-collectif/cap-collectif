<?php

namespace Capco\AppBundle\Mailer\Message;

use Capco\AppBundle\Model\ModerableInterface;
use Symfony\Component\Routing\RouterInterface;

class ModeratorMessage extends AdminMessage
{
    protected $moderationLinks = [];

    public function generateModerationLinks(ModerableInterface $moderable, RouterInterface $router)
    {
        $this->moderationLinks = [
          '{moderateSexualLink}' => $router->generate('moderate_contribution', [
            'token' => $moderable->getModerationToken(),
            'reason' => 'reporting.status.sexual',
          ], RouterInterface::ABSOLUTE_URL),
          '{moderateOffendingLink}' => $router->generate('moderate_contribution', [
            'token' => $moderable->getModerationToken(),
            'reason' => 'reporting.status.offending',
          ], RouterInterface::ABSOLUTE_URL),
          '{moderateInfringementLink}' => $router->generate('moderate_contribution', [
            'token' => $moderable->getModerationToken(),
            'reason' => 'infringement-of-rights',
          ], RouterInterface::ABSOLUTE_URL),
          '{moderateSpamLink}' => $router->generate('moderate_contribution', [
            'token' => $moderable->getModerationToken(),
            'reason' => 'reporting.status.spam',
          ], RouterInterface::ABSOLUTE_URL),
          '{moderateOffTopicLink}' => $router->generate('moderate_contribution', [
            'token' => $moderable->getModerationToken(),
            'reason' => 'reporting.status.off_topic',
          ], RouterInterface::ABSOLUTE_URL),
          '{moderateGuidelineViolationLink}' => $router->generate('moderate_contribution', [
            'token' => $moderable->getModerationToken(),
            'reason' => 'moderation-guideline-violation',
          ], RouterInterface::ABSOLUTE_URL),
        ];
    }

    public function getTemplateVars(): array
    {
        return array_merge($this->templateVars, $this->moderationLinks);
    }

    public function getFooterTemplate(): string
    {
        return 'notification.email.moderator_footer';
    }

    public function getFooterVars(): array
    {
        return [
            '{to}' => $this->getRecipient(0) ? self::escape($this->getRecipient(0)->getEmailAddress()) : '',
            '{sitename}' => $this->getSitename(),
            '{siteUrl}' => $this->getSiteUrl(),
            '{business}' => 'Cap Collectif',
            '{businessUrl}' => 'https://cap-collectif.com/',
        ];
    }
}
