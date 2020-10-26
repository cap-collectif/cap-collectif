<?php

namespace Capco\AppBundle\Mailer\Message\EmailingCampaign;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Mailer\Message\AbstractMessage;

class AbstractEmailingCampaignMessage extends AbstractMessage
{
    public const TEMPLATE = '@CapcoMail/campaign.html.twig';

    public function __construct(
        string $recipientEmail,
        EmailingCampaign $emailingCampaign,
        array $params
    ) {
        $params['content'] = $emailingCampaign->getContent();
        parent::__construct(
            $recipientEmail,
            null,
            null,
            $emailingCampaign->getObject(),
            [],
            self::TEMPLATE,
            $params,
            $emailingCampaign->getSenderEmail(),
            $emailingCampaign->getSenderName(),
            $emailingCampaign->getSenderEmail(),
            null,
            []
        );
    }
}
