<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\Common\Util\ClassUtils;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class RemoveSourceVoteMutation implements MutationInterface
{
    private EntityManagerInterface $em;
    private SourceVoteRepository $sourceVoteRepo;
    private SourceRepository $sourceRepo;
    private RedisStorageHelper $redisStorageHelper;
    private StepRequirementsResolver $stepRequirementsResolver;
    private Indexer $indexer;

    public function __construct(
        EntityManagerInterface $em,
        SourceVoteRepository $sourceVoteRepo,
        SourceRepository $sourceRepo,
        RedisStorageHelper $redisStorageHelper,
        StepRequirementsResolver $stepRequirementsResolver,
        Indexer $indexer
    ) {
        $this->em = $em;
        $this->sourceVoteRepo = $sourceVoteRepo;
        $this->sourceRepo = $sourceRepo;
        $this->redisStorageHelper = $redisStorageHelper;
        $this->stepRequirementsResolver = $stepRequirementsResolver;
        $this->indexer = $indexer;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $id = GlobalId::fromGlobalId($input->offsetGet('sourceId'))['id'];
        $source = $this->sourceRepo->find($id);

        $vote = $this->sourceVoteRepo->findOneBy(['user' => $viewer, 'source' => $source]);

        if (!$vote) {
            throw new UserError('You have not voted for this source.');
        }

        $step = $source->getStep();

        if (
            $step
            && !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($viewer, $step)
        ) {
            throw new UserError('You dont meets all the requirements.');
        }

        $deletedVoteId = $vote->getId();
        $this->indexer->remove(ClassUtils::getClass($vote), $deletedVoteId);
        $this->em->remove($vote);
        $this->em->flush();
        $this->indexer->finishBulk();

        $this->redisStorageHelper->recomputeUserCounters($viewer);

        return [
            'deletedVoteId' => $deletedVoteId,
            'contribution' => $source,
            'viewer' => $viewer,
        ];
    }
}
