<?php

namespace Capco\AppBundle\Processor\UserArchive;

use Capco\AppBundle\Notifier\UserArchiveNotifier;
use Capco\AppBundle\Repository\UserArchiveRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class UserArchiveRequestProcessor implements ProcessorInterface
{
    private $userArchiveRepository;
    private $userArchiveNotifier;

    public function __construct(UserArchiveRepository $userArchiveRepository, UserArchiveNotifier $userArchiveNotifier)
    {
        $this->userArchiveRepository = $userArchiveRepository;
        $this->userArchiveNotifier = $userArchiveNotifier;
    }

    public function process(Message $message, array $options)
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['userArchiveId'];
        $userArchive = $this->userArchiveRepository->find($id);
        if (!$userArchive) {
            throw new \RuntimeException('Unable to find userArchive with id : ' . $id);
        }
        // Use your notifier here
    }
}
