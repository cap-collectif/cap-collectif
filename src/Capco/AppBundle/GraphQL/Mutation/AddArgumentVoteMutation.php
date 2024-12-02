<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\ArgumentVote;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\DBAL\Exception\DriverException;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\Output\Edge;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class AddArgumentVoteMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly ArgumentRepository $argumentRepo, private readonly ArgumentVoteRepository $argumentVoteRepo, private readonly RedisStorageHelper $redisStorageHelper, private readonly StepRequirementsResolver $stepRequirementsResolver, private readonly Indexer $indexer)
    {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $contributionGlobalId = $input->offsetGet('argumentId');
        $contributionId = GlobalId::fromGlobalId($contributionGlobalId)['id'];
        $argument = $this->argumentRepo->find($contributionId);

        if (!$argument) {
            throw new UserError('Unknown argument with id: ' . $contributionId);
        }

        if (!$argument->canContribute($viewer)) {
            throw new UserError('Uncontribuable argument.');
        }

        $previousVote = $this->argumentVoteRepo->findOneBy([
            'user' => $viewer,
            'argument' => $argument,
        ]);

        if ($previousVote) {
            throw new UserError('Already voted.');
        }

        $step = $argument->getStep();

        if (
            $step
            && !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($viewer, $step)
        ) {
            throw new UserError('You dont meets all the requirements.');
        }

        $vote = (new ArgumentVote())->setArgument($argument)->setUser($viewer);

        try {
            $this->em->persist($vote);
            $this->em->flush();
            $this->redisStorageHelper->recomputeUserCounters($viewer);
            $this->indexer->index(ClassUtils::getClass($vote), $vote->getId());
            $this->indexer->finishBulk();
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
