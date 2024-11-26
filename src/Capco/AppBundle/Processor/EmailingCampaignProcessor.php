<?php

namespace Capco\AppBundle\Processor;

use Capco\AppBundle\Entity\EmailingCampaign;
use Capco\AppBundle\Mailer\EmailingCampaignSender;
use Capco\AppBundle\Repository\EmailingCampaignRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class EmailingCampaignProcessor implements ProcessorInterface
{
    private readonly EmailingCampaignSender $sender;
    private readonly EmailingCampaignRepository $repository;

    public function __construct(
        EmailingCampaignSender $sender,
        EmailingCampaignRepository $repository
    ) {
        $this->sender = $sender;
        $this->repository = $repository;
    }

    public function process(Message $message, array $options): bool
    {
        $data = json_decode($message->getBody());

        $campaign = $this->getCampaign($data);

        $this->sender->send($campaign);

        return true;
    }

    public function getCampaign(\stdClass $data): EmailingCampaign
    {
        return $this->repository->find($data->emailingCampaignId);
    }
}
