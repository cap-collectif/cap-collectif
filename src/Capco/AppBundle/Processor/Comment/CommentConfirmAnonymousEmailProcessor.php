<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\Notifier\CommentNotifier;
use Capco\AppBundle\Repository\CommentRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class CommentConfirmAnonymousEmailProcessor implements ProcessorInterface
{
    private readonly CommentRepository $commentRepository;
    private readonly CommentNotifier $notifier;

    public function __construct(CommentRepository $commentRepository, CommentNotifier $notifier)
    {
        $this->commentRepository = $commentRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['commentId'];
        $comment = $this->commentRepository->find($id);
        if (!$comment) {
            throw new \RuntimeException('Unable to find comment with id : ' . $id);
        }

        $this->notifier->onConfirmAnonymousEmail($comment);

        return true;
    }
}
