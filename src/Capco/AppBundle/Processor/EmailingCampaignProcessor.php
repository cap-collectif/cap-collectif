<?php

namespace Capco\AppBundle\Processor;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Mailer\EmailingCampaignSender;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class EmailingCampaignProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EmailingCampaignSender $sender,
        private readonly EmailingCampaignRepository $repository
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $data = json_decode((string) $message->getBody());

        $campaign = $this->getCampaign($data);

        $this->sender->send($campaign);

        return true;
    }

    public function getCampaign(\stdClass $data): EmailingCampaign
    {
        return $this->repository->find($data->emailingCampaignId);
    }
}
