<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class DeleteOpinionMutation implements MutationInterface
{
    private $em;
    private $opinionRepo;
    private $redisStorage;

    public function __construct(
        EntityManagerInterface $em,
        OpinionRepository $opinionRepo,
        RedisStorageHelper $redisStorage
    ) {
        $this->em = $em;
        $this->opinionRepo = $opinionRepo;
        $this->redisStorage = $redisStorage;
    }

    public function __invoke(Arg $input, User $user): array
    {
        $opinionId = $input->offsetGet('opinionId');
        $opinion = $this->opinionRepo->find($opinionId);

        if (!$opinion) {
            throw new UserError('Unknown opinion with id: ' . $opinionId);
        }

        if ($user !== $opinion->getAuthor()) {
            throw new UserError('You are not the author of opinion with id: ' . $opinionId);
        }

        $this->em->remove($opinion);
        $this->em->flush();
        $this->redisStorage->recomputeUserCounters($user);

        return ['deletedOpinionId' => $opinionId];
    }
}
