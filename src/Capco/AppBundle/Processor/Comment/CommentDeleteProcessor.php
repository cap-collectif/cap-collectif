<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\Notifier\CommentNotifier;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class CommentDeleteProcessor implements ProcessorInterface
{
    private $notifier;

    public function __construct(CommentNotifier $notifier)
    {
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options)
    {
        $comment = json_decode($message->getBody(), true);
        $this->notifier->onDelete($comment);

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
