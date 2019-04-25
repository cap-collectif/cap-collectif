<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Notifier\QuestionnaireReplyNotifier;
use Capco\AppBundle\Repository\ReplyRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Swarrot\Broker\Message;
use Swarrot\SwarrotBundle\Broker\Publisher;

class DeleteReplyMutation implements MutationInterface
{
    private $em;
    private $replyRepo;
    private $redisStorageHelper;
    private $publisher;

    public function __construct(
        EntityManagerInterface $em,
        ReplyRepository $replyRepo,
        RedisStorageHelper $redisStorageHelper,
        Publisher $publisher
    ) {
        $this->em = $em;
        $this->replyRepo = $replyRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->publisher = $publisher;
    }

    public function __invoke(string $id, User $user): array
    {
        /** @var Reply $reply */
        $reply = $this->replyRepo->find($id);

        if (!$reply) {
            throw new UserError('Reply not found');
        }

        if ($user->getId() !== $reply->getAuthor()->getId()) {
            throw new UserError('You are not the author of this reply');
        }

        $questionnaire = $reply->getQuestionnaire();

        $this->em->remove($reply);
        $this->em->flush();

        if ($questionnaire && $questionnaire->isNotifyResponseDelete()) {
            $this->publisher->publish(
                'questionnaire.reply',
                new Message(
                    json_encode([
                        'reply' => [
                            'author_email' => $reply->getAuthor()->getEmail(),
                            'author_slug' => $reply->getAuthor()->getSlug(),
                            'deleted_at' => (new \DateTimeImmutable('now'))->format('Y-m-d H:i:s'),
                            'project_title' => $reply
                                ->getStep()
                                ->getProject()
                                ->getTitle(),
                            'questionnaire_title' => $reply->getQuestionnaire()->getTitle(),
                            'questionnaire_id' => $reply->getQuestionnaire()->getId(),
                            'author_name' => $reply->getAuthor()->getUsername(),
                        ],
                        'state' => QuestionnaireReplyNotifier::QUESTIONNAIRE_REPLY_DELETE_STATE,
                    ])
                )
            );
        }

        $this->redisStorageHelper->recomputeUserCounters($user);

        return ['questionnaire' => $questionnaire];
    }
}
