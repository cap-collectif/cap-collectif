<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteUserReplyMutation implements MutationInterface
{
    public function __construct(private readonly EntityManagerInterface $em, private readonly ReplyRepository $replyRepo, private readonly Publisher $publisher, private readonly Indexer $indexer)
    {
    }

    public function __invoke(string $id, User $viewer): array
    {
        /** @var Reply $reply */
        $reply = $this->replyRepo->find(GlobalId::fromGlobalId($id)['id']);

        if (!$reply) {
            throw new UserError('Reply not found');
        }

        if ($viewer->getId() !== $reply->getAuthor()->getId()) {
            throw new UserError('You are not the author of this reply');
        }

        $questionnaire = $reply->getQuestionnaire();

        $this->indexer->remove(AbstractReply::class, $reply->getId());
        $this->indexer->finishBulk();

        $this->em->remove($reply);
        $this->em->flush();

        if ($questionnaire && $questionnaire->isNotifyResponseDelete()) {
            $this->publisher->publish(
                'questionnaire.reply',
                new Message(
                    json_encode([
                        'reply' => [
                            'author_slug' => $reply->getAuthor()->getSlug(),
                            'deleted_at' => (new \DateTimeImmutable('now'))->format('Y-m-d H:i:s'),
                            'project_title' => $reply
                                ->getStep()
                                ->getProject()
                                ->getTitle(),
                            'questionnaire_step_title' => $reply->getStep()->getTitle(),
                            'questionnaire_id' => $reply->getQuestionnaire()->getId(),
                            'author_name' => $reply->getAuthor()->getUsername(),
                            'is_anon_reply' => false,
                        ],
                        'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_DELETE_STATE,
                    ])
                )
            );
        }

        return ['questionnaire' => $questionnaire, 'replyId' => $id];
    }
}
