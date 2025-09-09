<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\ReplyVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteRepliesMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly Indexer $indexer,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function __invoke(Argument $args): array
    {
        $this->formatInput($args);
        $replyGlobalIds = $args->offsetGet('replyIds');

        $deletedIds = [];
        $replyIdsToRemoveFromIndex = [];
        $userIdsToReIndex = [];
        foreach ($replyGlobalIds as $replyGlobalId) {
            $reply = $this->globalIdResolver->resolve($replyGlobalId);

            if (!$reply instanceof Reply) {
                $this->logger->error(sprintf('Unknown reply with id : %s, are you passing other objects ?', $replyGlobalId));

                continue;
            }

            // saving some data before removing the entity from doctrine
            $replyId = $reply->getId();
            $replyIdsToRemoveFromIndex[] = $replyId;

            $author = $reply->getAuthor();
            if ($author instanceof User) {
                $userIdsToReIndex[] = $author->getId();
            }

            try {
                $this->em->remove($reply);
            } catch (\Throwable $e) {
                $this->logger->error(sprintf('Error while removing reply (id: %s): %s', $replyId, $e->getMessage()));
            }

            $deletedIds[] = $replyGlobalId;
        }

        $this->em->flush();

        // we have to finishBulk the replies deletion before re-indexing the users otherwise it won't work
        foreach ($replyIdsToRemoveFromIndex as $replyId) {
            try {
                $this->indexer->remove(Reply::class, $replyId);
            } catch (\Throwable $e) {
                $this->logger->error(sprintf('Error while removing reply (id: %s) from index: %s', $replyId, $e->getMessage()));
            }
        }
        $this->indexer->finishBulk();

        foreach ($userIdsToReIndex as $userId) {
            try {
                $this->indexer->index(User::class, $userId);
            } catch (\Throwable $e) {
                $this->logger->error(sprintf('Error while re-indexing user (id: %s): %s', $userId, $e->getMessage()));
            }
        }
        $this->indexer->finishBulk();

        return ['replyIds' => $deletedIds];
    }

    public function isGranted(array $replyIds, ?User $viewer = null): bool
    {
        if (!$viewer) {
            return false;
        }
        foreach ($replyIds as $replyId) {
            $reply = $this->globalIdResolver->resolve($replyId, $viewer);
            if (!$reply) {
                return false;
            }
            if (!$this->authorizationChecker->isGranted(ReplyVoter::DELETE_REPLY, $reply)) {
                return false;
            }
        }

        return true;
    }
}
