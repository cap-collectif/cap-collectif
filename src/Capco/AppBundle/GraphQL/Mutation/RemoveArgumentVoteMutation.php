<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Argument;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class RemoveArgumentVoteMutation implements MutationInterface
{
    private $em;
    private $argumentVoteRepo;
    private $argumentRepo;
    private $redisStorageHelper;

    public function __construct(
        EntityManagerInterface $em,
        ArgumentVoteRepository $argumentVoteRepo,
        ArgumentRepository $argumentRepo,
        RedisStorageHelper $redisStorageHelper
    ) {
        $this->em = $em;
        $this->argumentVoteRepo = $argumentVoteRepo;
        $this->argumentRepo = $argumentRepo;
        $this->redisStorageHelper = $redisStorageHelper;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $id = $input->offsetGet('argumentId');
        $argument = $this->argumentRepo->find($id);

        $vote = $this->argumentVoteRepo->findOneBy(['user' => $viewer, 'argument' => $argument]);

        if (!$vote) {
            throw new UserError('You have not voted for this argument.');
        }

        $typeName = 'ArgumentVote';
        $deletedVoteId = GlobalId::toGlobalId($typeName, $vote->getId());

        $this->em->remove($vote);
        $this->em->flush();

        $this->redisStorageHelper->recomputeUserCounters($viewer);

        return [
            'deletedVoteId' => $deletedVoteId,
            'contribution' => $argument,
            'viewer' => $viewer,
        ];
    }
}
