<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\EventListener\CommentSubscriber;
use Capco\AppBundle\Manager\Notify;
use Capco\AppBundle\Repository\CommentRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class CommentDeleteProcessor implements ProcessorInterface
{
    private $commentRepository;
    private $notifier;

    public function __construct(CommentRepository $commentRepository, Notify $notifier)
    {
        $this->notifier = $notifier;
        $this->commentRepository = $commentRepository;
    }

    public function process(Message $message, array $options)
    {
        $json = json_decode($message->getBody(), true);

        if ($json['notifying']) {
            switch ($json['notifyTo']) {
                case CommentSubscriber::NOTIFY_TO_ADMIN:
                    $this->notifier->notifyProposalComment($json, 'delete');
                    break;
            }
        }

        return true;
    }
}
