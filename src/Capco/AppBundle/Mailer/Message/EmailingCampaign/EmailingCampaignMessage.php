<?php

namespace Capco\AppBundle\Mailer\Message\EmailingCampaign;

use Capco\AppBundle\Entity\EmailingCampaign;
use Doctrine\Common\Collections\Collection;

class EmailingCampaignMessage extends AbstractEmailingCampaignMessage
{
    public function __construct(EmailingCampaign $emailingCampaign, array $params)
    {
        parent::__construct('', $emailingCampaign, $params);
        $this->recipients = [];
    }

    public function setRecipients(Collection $users): self
    {
        $this->recipients = [];
        foreach ($users as $user) {
            $this->addRecipient($user->getEmail());
        }

        return $this;
    }
}
