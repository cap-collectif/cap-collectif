<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\Notifier\CommentNotifier;
use Capco\AppBundle\Repository\CommentRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class CommentUpdateProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly CommentRepository $commentRepository,
        private readonly CommentNotifier $notifier
    ) {
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $id = $json['commentId'];
        $comment = $this->commentRepository->find($id);
        if (!$comment) {
            throw new \RuntimeException('Unable to find comment with id : ' . $id);
        }

        $this->notifier->onUpdate($comment);

        return true;
    }
}
