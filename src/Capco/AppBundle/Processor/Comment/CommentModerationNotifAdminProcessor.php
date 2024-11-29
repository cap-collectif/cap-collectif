<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\Notifier\CommentNotifier;
use Capco\AppBundle\Repository\CommentRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class CommentModerationNotifAdminProcessor implements ProcessorInterface
{
    private readonly CommentNotifier $notifier;
    private readonly CommentRepository $commentRepository;

    public function __construct(CommentNotifier $notifier, CommentRepository $commentRepository)
    {
        $this->notifier = $notifier;
        $this->commentRepository = $commentRepository;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode((string) $message->getBody(), true);
        $id = $json['commentId'];
        $comment = $this->commentRepository->find($id);
        if (!$comment) {
            throw new \RuntimeException('Unable to find comment with id : ' . $id);
        }

        $this->notifier->onModerationNotifAdmin($comment);

        return true;
    }
}
