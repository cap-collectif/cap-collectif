<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\EventListener\CommentSubscriber;
use Capco\AppBundle\Manager\Notify;
use Capco\AppBundle\Repository\CommentRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class CommentCreateProcessor implements ProcessorInterface
{
    private $commentRepository;
    private $notifier;

    public function __construct(CommentRepository $commentRepository, Notify $notifier)
    {
        $this->commentRepository = $commentRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options)
    {
        $json = json_decode($message->getBody(), true);
        $comment = $this->commentRepository->find($json['commentId']);
        switch ($json['notify_type']) {
            case CommentSubscriber::NOTIFY_TO_ADMIN:
                $this->notifier->notifyProposalComment($comment, 'create');
                break;
            case CommentSubscriber::NOTIFY_TO_AUTHOR:
                $this->notifier->notifyUserProposalComment($comment);
                break;
        }

        return true;
    }
}
