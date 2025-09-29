<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\Notifier\CommentNotifier;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class CommentDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly CommentNotifier $notifier
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $comment = json_decode((string) $message->getBody(), true);
        $this->notifier->onDelete($comment);

        return true;
    }
}
