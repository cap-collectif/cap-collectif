<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\SourceVote;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Doctrine\DBAL\Exception\DriverException;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Overblog\GraphQLBundle\Definition\Source;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class AddSourceVoteMutation implements MutationInterface
{
    private $em;
    private $sourceRepo;
    private $sourceVoteRepo;
    private $redisStorageHelper;

    public function __construct(
        EntityManagerInterface $em,
        SourceRepository $sourceRepo,
        SourceVoteRepository $sourceVoteRepo,
        RedisStorageHelper $redisStorageHelper
    ) {
        $this->em = $em;
        $this->sourceRepo = $sourceRepo;
        $this->sourceVoteRepo = $sourceVoteRepo;
        $this->redisStorageHelper = $redisStorageHelper;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $contributionId = $input->offsetGet('sourceId');
        $source = $this->sourceRepo->find($contributionId);

        if (!$source) {
            throw new UserError('Unknown source with id: ' . $contributionId);
        }

        if (!$source->canContribute($viewer)) {
            throw new UserError('Can not vote for : ' . $contributionId);
        }

        $previousVote = $this->sourceVoteRepo->findOneBy([
            'user' => $viewer,
            'source' => $source,
        ]);

        if ($previousVote) {
            throw new UserError('Already voted.');
        }

        $vote = (new SourceVote())->setSource($source)->setUser($viewer);

        try {
            $this->em->persist($vote);
            $this->em->flush();
        } catch (DriverException $e) {
            // Updating sources votes count failed
            throw new UserError($e->getMessage());
        }
        $this->redisStorageHelper->recomputeUserCounters($viewer);

        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $vote);

        return [
            'voteEdge' => $edge,
            'viewer' => $viewer,
        ];
    }
}
