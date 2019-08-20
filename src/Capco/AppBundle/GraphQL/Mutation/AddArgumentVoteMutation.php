<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\ArgumentVote;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Doctrine\DBAL\Exception\DriverException;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;

class AddArgumentVoteMutation implements MutationInterface
{
    private $em;
    private $argumentRepo;
    private $argumentVoteRepo;
    private $redisStorageHelper;
    private $stepRequirementsResolver;

    public function __construct(
        EntityManagerInterface $em,
        ArgumentRepository $argumentRepo,
        ArgumentVoteRepository $argumentVoteRepo,
        RedisStorageHelper $redisStorageHelper,
        StepRequirementsResolver $stepRequirementsResolver
    ) {
        $this->em = $em;
        $this->argumentRepo = $argumentRepo;
        $this->argumentVoteRepo = $argumentVoteRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->stepRequirementsResolver = $stepRequirementsResolver;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $contributionId = $input->offsetGet('argumentId');
        $argument = $this->argumentRepo->find($contributionId);

        if (!$argument) {
            throw new UserError('Unknown argument with id: ' . $contributionId);
        }

        if (!$argument->canContribute($viewer)) {
            throw new UserError('Uncontribuable argument.');
        }

        $previousVote = $this->argumentVoteRepo->findOneBy([
            'user' => $viewer,
            'argument' => $argument
        ]);

        if ($previousVote) {
            throw new UserError('Already voted.');
        }

        $step = $argument->getStep();

        if (
            $step &&
            !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($viewer, $step)
        ) {
            throw new UserError('You dont meets all the requirements.');
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
            'viewer' => $viewer
        ];
    }
}
