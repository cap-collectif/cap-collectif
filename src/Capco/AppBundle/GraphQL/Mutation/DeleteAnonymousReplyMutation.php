<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Repository\ReplyAnonymousRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteAnonymousReplyMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private ReplyAnonymousRepository $replyAnonymousRepository;
    private Indexer $indexer;
    private Publisher $publisher;

    public function __construct(
        EntityManagerInterface $em,
        ReplyAnonymousRepository $replyAnonymousRepository,
        Indexer $indexer,
        Publisher $publisher
    ) {
        $this->em = $em;
        $this->replyAnonymousRepository = $replyAnonymousRepository;
        $this->indexer = $indexer;
        $this->publisher = $publisher;
    }

    public function __invoke(Argument $args): array
    {
        $hashedToken = $args->offsetGet('hashedToken');
        $decodedToken = base64_decode($hashedToken);
        $reply = $this->replyAnonymousRepository->findOneBy(['token' => $decodedToken]);

        if (!$reply) {
            throw new UserError('Reply not found');
        }

        $replyId = GlobalId::toGlobalId('Reply', $reply->getId());
        $questionnaire = $reply->getQuestionnaire();

        $this->indexer->remove(AbstractReply::class, $reply->getId());
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
}
