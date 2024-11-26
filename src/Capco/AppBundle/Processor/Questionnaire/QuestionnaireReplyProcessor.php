<?php

namespace Capco\AppBundle\Processor\Questionnaire;

use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Capco\AppBundle\Repository\ReplyRepository;
use Swarrot\Broker\Message;
use Swarrot\Processor\ProcessorInterface;

class QuestionnaireReplyProcessor implements ProcessorInterface
{
    private readonly ReplyRepository $replyRepository;
    private readonly QuestionnaireReplyNotifier $notifier;
    private readonly ReplyAnonymousRepository $replyAnonymousRepository;

    public function __construct(
        ReplyRepository $replyRepository,
        ReplyAnonymousRepository $replyAnonymousRepository,
        QuestionnaireReplyNotifier $notifier
    ) {
        $this->replyRepository = $replyRepository;
        $this->notifier = $notifier;
        $this->replyAnonymousRepository = $replyAnonymousRepository;
    }

    public function process(Message $message, array $options): bool
    {
        $json = json_decode($message->getBody(), true);
        $state = $json['state'];

        switch ($state) {
            case QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_CREATE_STATE:
            case QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_UPDATE_STATE:
                $replyId = $json['replyId'];

                $reply = $this->getReply($replyId);
                if (!$reply) {
                    throw new \RuntimeException('Unable to find reply/replyAnonymous with id : ' . $replyId);
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
                throw new \LogicException(sprintf('Unknown questionnaire reply state: "%s"', $state));
        }

        return true;
    }

    private function getReply(string $replyId): ?AbstractReply
    {
        $reply = $this->replyRepository->find($replyId);
        if (!$reply) {
            $reply = $this->replyAnonymousRepository->find($replyId);
        }

        return $reply;
    }
}
