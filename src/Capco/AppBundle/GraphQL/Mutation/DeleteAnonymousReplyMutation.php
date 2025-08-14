<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteAnonymousReplyMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private EntityManagerInterface $em, private Indexer $indexer, private Publisher $publisher, private GlobalIdResolver $globalIdResolver)
    {
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);

        $reply = $this->getReply($args);

        $replyId = $args->offsetGet('replyId');
        $questionnaire = $reply->getQuestionnaire();

        $this->indexer->remove(Reply::class, $reply->getId());
        $this->indexer->finishBulk();

        $this->em->remove($reply);
        $this->em->flush();

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

        /** * @var Reply $reply  */
        $reply = $this->globalIdResolver->resolve($replyId);

        if (null === $reply) {
            throw new UserError('Reply not found');
        }

        $participant = $reply->getParticipant();
        if (null === $participant) {
            throw new UserError('Reply is not anonymous');
        }

        $participantToken = $argument->offsetGet('participantToken');
        $decodedToken = base64_decode((string) $participantToken);

        if ($participant->getToken() !== $decodedToken) {
            throw new UserError('Given token does not match corresponding Participant');
        }

        return $reply;
    }
}
