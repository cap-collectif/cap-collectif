<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\Manager\Notify;
use Capco\AppBundle\Repository\CommentRepository;
use Doctrine\ORM\EntityManager;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class CommentDeleteProcessor implements ProcessorInterface
{
    private $em;
    private $commentRepository;
    private $notifier;

    public function __construct(EntityManager $em, CommentRepository $commentRepository, Notify $notifier)
    {
        $this->em = $em;
        $this->commentRepository = $commentRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options)
    {
        $json = json_decode($message->getBody(), true);
        $this->em->getFilters()->disable('softdeleted');
        $comment = $this->commentRepository->find($json['commentId']);
        $this->notifier->notifyComment($comment, 'delete');

        return true;
    }
}
