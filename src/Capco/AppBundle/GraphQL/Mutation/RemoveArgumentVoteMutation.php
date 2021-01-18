<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\Entity\Argument;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Capco\AppBundle\Repository\ArgumentRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;

class RemoveArgumentVoteMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private ArgumentVoteRepository $argumentVoteRepo;
    private ArgumentRepository $argumentRepo;
    private RedisStorageHelper $redisStorageHelper;
    private StepRequirementsResolver $stepRequirementsResolver;
    private Indexer $indexer;

    public function __construct(
        EntityManagerInterface $em,
        ArgumentVoteRepository $argumentVoteRepo,
        ArgumentRepository $argumentRepo,
        RedisStorageHelper $redisStorageHelper,
        StepRequirementsResolver $stepRequirementsResolver,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->argumentVoteRepo = $argumentVoteRepo;
        $this->argumentRepo = $argumentRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->stepRequirementsResolver = $stepRequirementsResolver;
        $this->indexer = $indexer;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $id = GlobalId::fromGlobalId($input->offsetGet('argumentId'))['id'];
        /** @var Argument $argument */
        $argument = $this->argumentRepo->find($id);

        $vote = $this->argumentVoteRepo->findOneBy(['user' => $viewer, 'argument' => $argument]);

        if (!$vote) {
            throw new UserError('You have not voted for this argument.');
        }

        $step = $argument->getStep();

        if (
            $step &&
            !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($viewer, $step)
        ) {
            throw new UserError('You dont meets all the requirements.');
        }
        $typeName = 'ArgumentVote';
        $deletedVoteId = GlobalId::toGlobalId($typeName, $vote->getId());

        $this->indexer->remove(ClassUtils::getClass($vote), $vote->getId());
        $this->em->remove($vote);
        $this->em->flush();
        $this->indexer->finishBulk();

        $this->redisStorageHelper->recomputeUserCounters($viewer);

        return [
            'deletedVoteId' => $deletedVoteId,
            'contribution' => $argument,
            'viewer' => $viewer,
        ];
    }
}
