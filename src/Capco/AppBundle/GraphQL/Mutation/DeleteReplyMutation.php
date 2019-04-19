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

class DeleteReplyMutation implements MutationInterface
{
    private $em;
    private $replyRepo;
    private $redisStorageHelper;
    private $questionnaireReplyNotifier;

    public function __construct(
        EntityManagerInterface $em,
        ReplyRepository $replyRepo,
        RedisStorageHelper $redisStorageHelper,
        QuestionnaireReplyNotifier $questionnaireReplyNotifier
    ) {
        $this->em = $em;
        $this->replyRepo = $replyRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->questionnaireReplyNotifier = $questionnaireReplyNotifier;
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
        $this->questionnaireReplyNotifier->onDelete($reply);
        $this->em->flush();

        $this->redisStorageHelper->recomputeUserCounters($user);

        return ['questionnaire' => $questionnaire];
    }
}
