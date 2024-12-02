<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Elasticsearch\Indexer;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
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
    use MutationTrait;

    public function __construct(private readonly EntityManagerInterface $em, private readonly SourceVoteRepository $sourceVoteRepo, private readonly SourceRepository $sourceRepo, private readonly RedisStorageHelper $redisStorageHelper, private readonly StepRequirementsResolver $stepRequirementsResolver, private readonly Indexer $indexer)
    {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
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
