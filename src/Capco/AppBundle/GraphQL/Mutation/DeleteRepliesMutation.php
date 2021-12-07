<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\AbstractReply;
use Capco\AppBundle\Entity\ReplyAnonymous;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\Security\ReplyVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteRepliesMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private AuthorizationCheckerInterface $authorizationChecker;
    private GlobalIdResolver $globalIdResolver;
    private Indexer $indexer;

    public function __construct(
        EntityManagerInterface $em,
        AuthorizationCheckerInterface $authorizationChecker,
        GlobalIdResolver $globalIdResolver,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->authorizationChecker = $authorizationChecker;
        $this->globalIdResolver = $globalIdResolver;
        $this->indexer = $indexer;
    }

    public function __invoke(Argument $args): array
    {
        $replyIds = $args->offsetGet('replyIds');
        $decodedReplyIds = array_map(
            fn(string $globalId) => GlobalId::fromGlobalId($globalId)['id'],
            $replyIds
        );

        foreach ($decodedReplyIds as $decodedReplyId) {
            $this->indexer->remove(AbstractReply::class, $decodedReplyId);
        }
        $this->indexer->finishBulk();

        $replyEntity = Reply::class;
        $replyAnonEntity = ReplyAnonymous::class;

        $this->deleteReply($replyEntity, $decodedReplyIds);
        $this->deleteReply($replyAnonEntity, $decodedReplyIds);

        return ['replyIds' => $replyIds];
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

    private function deleteReply(string $entity, array $ids): void
    {
        $this->em
            ->createQuery(
                <<<DQL
    DELETE ${entity} ui WHERE ui.id IN (:ids)
DQL
            )
            ->execute([
                'ids' => $ids,
            ]);
    }
}
