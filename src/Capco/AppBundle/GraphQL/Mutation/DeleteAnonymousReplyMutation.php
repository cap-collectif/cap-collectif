<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Participant;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Exception\ParticipantNotFoundException;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Service\ParticipantHelper;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteAnonymousReplyMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private EntityManagerInterface $em,
        private Indexer $indexer,
        private Publisher $publisher,
        private GlobalIdResolver $globalIdResolver,
        private ParticipantHelper $participantHelper,
    ) {
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);

        $reply = $this->getReply($args);

        $replyId = $args->offsetGet('replyId');
        $replyDatabaseId = $reply->getId();
        $questionnaire = $reply->getQuestionnaire();
        $participant = $reply->getParticipant();

        if ($participant instanceof Participant) {
            $participant->removeReply($reply);
        }

        $this->em->remove($reply);
        $this->em->flush();

        $this->indexer->remove(Reply::class, $replyDatabaseId);
        $this->indexer->finishBulk();

        if ($participant instanceof Participant) {
            $this->indexer->index(Participant::class, $participant->getId());
            $this->indexer->finishBulk();
        }

        if ($questionnaire && $questionnaire->isNotifyResponseDelete()) {
            $step = $reply->getStep();
            $this->publisher->publish(
                'questionnaire.reply',
                new Message(
                    json_encode([
                        'reply' => [
                            'author_slug' => '',
                            'deleted_at' => (new \DateTimeImmutable('now'))->format('Y-m-d H:i:s'),
                            'project_title' => $step->getProject()->getTitle(),
                            'questionnaire_step_title' => $step->getTitle(),
                            'questionnaire_id' => $questionnaire->getId(),
                            'author_name' => '',
                            'is_anon_reply' => true,
                        ],
                        'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_DELETE_STATE,
                    ])
                )
            );
        }

        return ['replyId' => $replyId, 'questionnaire' => $questionnaire];
    }

    private function getReply(Argument $argument): Reply
    {
        $replyId = $argument->offsetGet('replyId');

        $participantToken = $argument->offsetGet('participantToken');

        try {
            $participant = $this->participantHelper->getParticipantByToken($participantToken);
        } catch (ParticipantNotFoundException $e) {
            throw new UserError($e->getMessage());
        }

        /** * @var Reply $reply  */
        $reply = $this->globalIdResolver->resolve($replyId, $participant);

        if (null === $reply) {
            throw new UserError('Reply not found');
        }

        $replyParticipant = $reply->getParticipant();
        if (null === $replyParticipant) {
            throw new UserError('Reply is not anonymous');
        }

        if ($replyParticipant->getId() !== $participant->getId()) {
            throw new UserError('Given token does not match corresponding Participant');
        }

        return $reply;
    }
}
