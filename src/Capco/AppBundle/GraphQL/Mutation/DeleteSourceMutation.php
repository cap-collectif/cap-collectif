<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\SourceRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;

class DeleteSourceMutation implements MutationInterface
{
    private $em;
    private $sourceRepo;
    private $redisStorage;
    private $stepRequirementsResolver;

    public function __construct(
        EntityManagerInterface $em,
        SourceRepository $sourceRepo,
        RedisStorageHelper $redisStorage,
        StepRequirementsResolver $stepRequirementsResolver
    ) {
        $this->em = $em;
        $this->sourceRepo = $sourceRepo;
        $this->redisStorage = $redisStorage;
        $this->stepRequirementsResolver = $stepRequirementsResolver;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $sourceId = $input->offsetGet('sourceId');
        $source = $this->sourceRepo->find($sourceId);

        if (!$source) {
            throw new UserError('Unknown source with id: ' . $sourceId);
        }

        if ($viewer !== $source->getAuthor()) {
            throw new UserError('You are not the author of source with id: ' . $sourceId);
        }

        $step = $source->getStep();

        if (
            $step &&
            !$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($viewer, $step)
        ) {
            throw new UserError('You dont meets all the requirements.');
        }

        $sourceable = $source->getRelated();

        $this->em->remove($source);
        $this->em->flush();
        $this->redisStorage->recomputeUserCounters($viewer);

        return ['sourceable' => $sourceable, 'deletedSourceId' => $sourceId];
    }
}
