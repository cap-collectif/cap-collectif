<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\SourceRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class DeleteSourceMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(private EntityManagerInterface $em, private SourceRepository $sourceRepo, private RedisStorageHelper $redisStorage, private StepRequirementsResolver $stepRequirementsResolver)
    {
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);
        $sourceGlobalId = $input->offsetGet('sourceId');
        $sourceId = GlobalId::fromGlobalId($sourceGlobalId)['id'];
        $source = $this->sourceRepo->find($sourceId);

        if (!$source) {
            throw new UserError('Unknown source with id: ' . $sourceId);
        }

        if ($viewer !== $source->getAuthor() && !$viewer->isAdmin()) {
            throw new UserError('You are not the author of source with id: ' . $sourceId);
        }

        $step = $source->getStep();

        if (
            $step
            && !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($viewer, $step)
        ) {
            throw new UserError('You dont meets all the requirements.');
        }

        $sourceable = $source->getRelated();

        $this->em->remove($source);
        $this->em->flush();
        $this->redisStorage->recomputeUserCounters($viewer);

        return ['sourceable' => $sourceable, 'deletedSourceId' => $sourceGlobalId];
    }
}
