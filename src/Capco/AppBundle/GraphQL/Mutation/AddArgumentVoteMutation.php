<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\ArgumentVote;
use Doctrine\ORM\EntityManagerInterface;
use Capco\AppBundle\Entity\OpinionVersion;
use Overblog\GraphQLBundle\Error\UserError;
use Doctrine\DBAL\Exception\DriverException;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\ArgumentRepository;
use Symfony\Component\HttpFoundation\RequestStack;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class AddArgumentVoteMutation implements MutationInterface
{
    private $em;
    private $argumentRepo;
    private $argumentVoteRepo;
    private $redisStorageHelper;

    public function __construct(
        EntityManagerInterface $em,
        ArgumentRepository $argumentRepo,
        ArgumentVoteRepository $argumentVoteRepo,
        RedisStorageHelper $redisStorageHelper
    ) {
        $this->em = $em;
        $this->argumentRepo = $argumentRepo;
        $this->argumentVoteRepo = $argumentVoteRepo;
        $this->redisStorageHelper = $redisStorageHelper;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $contributionId = $input->offsetGet('argumentId');
        $argument = $this->argumentRepo->find($contributionId);

        if (!$argument) {
            throw new UserError('Unknown argument with id: ' . $contributionId);
        }

        if (!$argument->canContribute()) {
            throw new UserError('Uncontribuable argument.');
        }

        $previousVote = $this->argumentVoteRepo->findOneBy([
            'user' => $viewer,
            'argument' => $argument,
        ]);

        if ($previousVote) {
            throw new UserError('Already voted.');
        }

        $vote = (new ArgumentVote())->setArgument($argument)->setUser($viewer);

        try {
            $this->em->persist($vote);
            $this->em->flush();
            $this->redisStorageHelper->recomputeUserCounters($viewer);
        } catch (DriverException $e) {
            // Updating arguments votes count failed
            throw new UserError($e->getMessage());
        }

        $edge = new Edge(ConnectionBuilder::offsetToCursor(0), $vote);

        return [
            'voteEdge' => $edge,
            'viewer' => $viewer,
        ];
    }
}
