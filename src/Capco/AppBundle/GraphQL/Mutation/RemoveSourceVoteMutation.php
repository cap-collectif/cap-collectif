<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;

class RemoveSourceVoteMutation implements MutationInterface
{
    private $em;
    private $sourceVoteRepo;
    private $sourceRepo;
    private $redisStorageHelper;
    private $stepRequirementsResolver;

    public function __construct(
        EntityManagerInterface $em,
        SourceVoteRepository $sourceVoteRepo,
        SourceRepository $sourceRepo,
        RedisStorageHelper $redisStorageHelper,
        StepRequirementsResolver $stepRequirementsResolver
    ) {
        $this->em = $em;
        $this->sourceVoteRepo = $sourceVoteRepo;
        $this->sourceRepo = $sourceRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->stepRequirementsResolver = $stepRequirementsResolver;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $id = $input->offsetGet('sourceId');
        $source = $this->sourceRepo->find($id);

        $vote = $this->sourceVoteRepo->findOneBy(['user' => $viewer, 'source' => $source]);

        if (!$vote) {
            throw new UserError('You have not voted for this source.');
        }

        $step = $source->getStep();

        if (
            $step &&
            !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($viewer, $step)
        ) {
            throw new UserError('You dont meets all the requirements.');
        }

        $deletedVoteId = $vote->getId();

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
