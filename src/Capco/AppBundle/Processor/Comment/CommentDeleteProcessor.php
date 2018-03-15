<?php

namespace Capco\AppBundle\Processor\Comment;

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
        $this->notifier->notifyProposalComment($json, 'delete');

        return true;
    }
}
