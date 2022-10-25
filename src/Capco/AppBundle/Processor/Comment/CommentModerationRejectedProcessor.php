<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\Notifier\CommentNotifier;
use Capco\AppBundle\Repository\CommentRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class CommentModerationRejectedProcessor implements ProcessorInterface
{
    private CommentNotifier $notifier;
    private CommentRepository $commentRepository;

    public function __construct(CommentNotifier $notifier, CommentRepository $commentRepository)
    {
        $this->notifier = $notifier;
        $this->commentRepository = $commentRepository;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['commentId'];
        $comment = $this->commentRepository->find($id);
        if (!$comment) {
            throw new \RuntimeException('Unable to find comment with id : ' . $id);
        }

        $this->notifier->onModerationRejected($comment);

        return true;
    }
}
