<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Security\PostVoter;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class DeletePostMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly GlobalIdResolver $globalIdResolver,
        private readonly AuthorizationCheckerInterface $authorizationChecker
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $id = $input->offsetGet('id');
        $post = $this->globalIdResolver->resolve($id, $viewer);

        $this->em->remove($post);
        $this->em->flush();

        return ['deletedPostId' => $id];
    }

    public function isGranted(string $postId, User $viewer): bool
    {
        $post = $this->globalIdResolver->resolve($postId, $viewer);

        if ($post) {
            return $this->authorizationChecker->isGranted(PostVoter::DELETE, $post);
        }

        return false;
    }
}
