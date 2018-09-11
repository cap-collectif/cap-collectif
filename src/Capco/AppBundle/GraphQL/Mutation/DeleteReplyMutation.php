<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Helper\RedisStorageHelper;
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

    public function __construct(
        EntityManagerInterface $em,
        ReplyRepository $replyRepo,
        RedisStorageHelper $redisStorageHelper
    ) {
        $this->em = $em;
        $this->replyRepo = $replyRepo;
        $this->redisStorageHelper = $redisStorageHelper;
    }

    public function __invoke(string $id, User $user): array
    {
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
        $this->redisStorageHelper->recomputeUserCounters($user);

        return ['questionnaire' => $questionnaire];
    }
}
