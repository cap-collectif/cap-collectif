<?php

namespace Capco\AppBundle\Mailer\Message;

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
}
