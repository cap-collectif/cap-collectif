<?php

namespace Capco\AppBundle\Processor\Questionnaire;

use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Repository\ReplyRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class QuestionnaireReplyProcessor implements ProcessorInterface
{
    private $repository;
    private $notifier;

    public function __construct(ReplyRepository $repository, QuestionnaireReplyNotifier $notifier)
    {
        $this->repository = $repository;
        $this->notifier = $notifier;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $state = $json['state'];

        switch ($state) {
            case QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE:
            case QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE:
                $replyId = $json['replyId'];

                $reply = $this->repository->find($replyId);
                if (!$reply) {
                    throw new \RuntimeException('Unable to find reply with id : ' . $replyId);
                }

                QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE === $state
                    ? $this->notifier->onCreate($reply)
                    : $this->notifier->onUpdate($reply);

                break;
            case QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_DELETE_STATE:
                $reply = $json['reply'];
                $this->notifier->onDelete($reply);

                break;
            default:
                throw new \LogicException(
                    sprintf('Unknown questionnaire reply state: "%s"', $state)
                );
        }

        return true;
    }
}
