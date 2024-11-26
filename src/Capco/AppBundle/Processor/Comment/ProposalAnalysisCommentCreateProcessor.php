<?php

namespace Capco\AppBundle\Processor\Comment;

use Capco\AppBundle\Notifier\ProposalAnalysisCommentNotifier;
use Capco\AppBundle\Repository\CommentRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class ProposalAnalysisCommentCreateProcessor implements ProcessorInterface
{
    private readonly CommentRepository $commentRepository;
    private readonly ProposalAnalysisCommentNotifier $notifier;

    public function __construct(
        CommentRepository $commentRepository,
        ProposalAnalysisCommentNotifier $notifier
    ) {
        $this->commentRepository = $commentRepository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $id = $json['commentId'];
        $emailsRecipients = $json['emailsRecipients'];
        $comment = $this->commentRepository->find($id);
        if (!$comment) {
            throw new \RuntimeException('Unable to find comment with id : ' . $id);
        }

        $this->notifier->onCreate($comment, $emailsRecipients);

        return true;
    }
}
