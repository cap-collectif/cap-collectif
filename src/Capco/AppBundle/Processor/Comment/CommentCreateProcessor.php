<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\Entity\IdeaComment;
use Capco\AppBundle\Entity\ProposalComment;
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

        if ($comment instanceof ProposalComment && $comment->getProposal()->getProposalForm()->isNotifyingCommentOnCreate()) {
            $this->notifier->notifyProposalComment($comment, 'create');
        }

        if (($comment instanceof ProposalComment || $comment instanceof IdeaComment) &&
            $comment->getRelatedObject()->getAuthor()->getNotificationsConfiguration()->isOnProposalCommentMail() &&
            $comment->getRelatedObject()->getAuthor() !== $comment->getAuthor()) {
            $this->notifier->notifyUserProposalComment($comment);
        }

        return true;
    }
}
