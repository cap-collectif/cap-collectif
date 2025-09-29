<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\GraphQL\Resolver\Requirement\StepRequirementsResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Helper\RedisStorageHelper;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;

class RemoveOpinionVoteMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private EntityManagerInterface $em,
        private OpinionVoteRepository $opinionVoteRepo,
        private OpinionRepository $opinionRepo,
        private OpinionVersionVoteRepository $versionVoteRepo,
        private OpinionVersionRepository $versionRepo,
        private RedisStorageHelper $redisStorageHelper,
        private StepRequirementsResolver $stepRequirementsResolver
    ) {
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $this->formatInput($input);
        $id = $input->offsetGet('opinionId');
        $opinion = $this->opinionRepo->find(GlobalId::fromGlobalId($id)['id']);
        $version = $this->versionRepo->find($id);

        $contribution = $opinion ?? $version;

        if (!$contribution->canContribute($viewer)) {
            throw new UserError('Uncontribuable opinion.');
        }

        $vote = $this->opinionVoteRepo->findOneBy(['user' => $viewer, 'opinion' => $contribution]);

        if (!$vote) {
            $vote = $this->versionVoteRepo->findOneBy([
                'user' => $viewer,
                'opinionVersion' => $contribution,
            ]);
        }

        if (!$vote) {
            throw new UserError('You have not voted for this opinion.');
        }

        $step = $contribution->getStep();
        if (!$this->stepRequirementsResolver->viewerMeetsTheRequirementsResolver($viewer, $step)) {
            throw new UserError('You dont meets all the requirements.');
        }

        $typeName = $contribution instanceof Opinion ? 'OpinionVote' : 'VersionVote';
        $deletedVoteId = GlobalId::toGlobalId($typeName, $vote->getId());

        $this->em->remove($vote);
        $this->em->flush();

        $this->redisStorageHelper->recomputeUserCounters($viewer);

        return [
            'deletedVoteId' => $deletedVoteId,
            'contribution' => $contribution,
            'viewer' => $viewer,
        ];
    }
}
