<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Source;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class RemoveSourceVoteMutation implements MutationInterface
{
    private $em;
    private $sourceVoteRepo;
    private $sourceRepo;
    private $redisStorageHelper;

    public function __construct(
        EntityManagerInterface $em,
        SourceVoteRepository $sourceVoteRepo,
        SourceRepository $sourceRepo,
        RedisStorageHelper $redisStorageHelper
    ) {
        $this->em = $em;
        $this->sourceVoteRepo = $sourceVoteRepo;
        $this->sourceRepo = $sourceRepo;
        $this->redisStorageHelper = $redisStorageHelper;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $id = $input->offsetGet('sourceId');
        $source = $this->sourceRepo->find($id);

        $vote = $this->sourceVoteRepo->findOneBy(['user' => $viewer, 'source' => $source]);

        if (!$vote) {
            throw new UserError('You have not voted for this source.');
        }

        $typeName = 'SourceVote';
        $deletedVoteId = GlobalId::toGlobalId($typeName, $vote->getId());

        $this->em->remove($vote);
        $this->em->flush();

        $this->redisStorageHelper->recomputeUserCounters($viewer);

        return [
            'deletedVoteId' => $deletedVoteId,
            'contribution' => $source,
            'viewer' => $viewer,
        ];
    }
}
