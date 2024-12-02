<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteOpinionMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private EntityManagerInterface $em, private OpinionRepository $opinionRepo, private RedisStorageHelper $redisStorage)
    {
    }

    public function __invoke(Arg $input, User $user): array
    {
        $this->formatInput($input);
        $opinionGlobalId = $input->offsetGet('opinionId');
        $opinionId = GlobalId::fromGlobalId($opinionGlobalId)['id'];
        $opinion = $this->opinionRepo->find($opinionId);

        if (!$opinion) {
            throw new UserError("Unknown opinion with id: {$opinionId}");
        }

        if ($user !== $opinion->getAuthor()) {
            throw new UserError('You are not the author of opinion with id: ' . $opinionId);
        }

        $this->em->remove($opinion);
        $this->em->flush();
        $this->redisStorage->recomputeUserCounters($user);

        return ['deletedOpinionId' => $opinionGlobalId];
    }
}
