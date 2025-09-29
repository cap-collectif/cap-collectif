<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\DataLoader\Commentable\CommentableCommentsDataLoader;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Security\CommentVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeleteCommentMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly RedisStorageHelper $redisStorage,
        private readonly LoggerInterface $logger,
        private readonly CommentableCommentsDataLoader $commentableCommentsDataLoader,
        private readonly AuthorizationCheckerInterface $authorizationChecker,
        private readonly GlobalIdResolver $globalIdResolver
    ) {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $commentGlobalId = $input->offsetGet('id');
        $comment = $this->globalIdResolver->resolve($commentGlobalId, $viewer);

        if (!$comment) {
            $this->logger->error('Unknown comment with id: ' . $commentGlobalId);

            return [
                'userErrors' => [
                    [
                        'message' => 'Comment not found.',
                    ],
                ],
            ];
        }

        $this->em->remove($comment);
        $this->em->flush();
        if ($comment->getRelatedObject()) {
            $this->commentableCommentsDataLoader->invalidate($comment->getRelatedObject()->getId());
        }
        $this->redisStorage->recomputeUserCounters($viewer);

        return ['deletedCommentId' => $commentGlobalId, 'userErrors' => []];
    }

    public function isGranted(string $commentId, ?User $viewer = null): bool
    {
        $comment = $this->globalIdResolver->resolve($commentId, $viewer);

        if (!$viewer || !$comment) {
            return false;
        }

        return $this->authorizationChecker->isGranted(CommentVoter::DELETE, $comment);
    }
}
