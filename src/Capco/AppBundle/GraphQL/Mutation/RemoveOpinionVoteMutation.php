<?php
namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\AppBundle\Repository\OpinionVersionRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class RemoveOpinionVoteMutation implements MutationInterface
{
    private $em;
    private $opinionVoteRepo;
    private $versionVoteRepo;
    private $opinionRepo;
    private $versionRepo;
    private $redisStorageHelper;

    public function __construct(
        EntityManagerInterface $em,
        OpinionVoteRepository $opinionVoteRepo,
        OpinionRepository $opinionRepo,
        OpinionVersionVoteRepository $versionVoteRepo,
        OpinionVersionRepository $versionRepo
    ) {
        $this->em = $em;
        $this->opinionVoteRepo = $opinionVoteRepo;
        $this->opinionRepo = $opinionRepo;
        $this->versionRepo = $versionRepo;
        $this->versionVoteRepo = $versionVoteRepo;
    }

    public function __invoke(Argument $input, User $viewer): array
    {
        $id = $input->offsetGet('opinionId');
        $opinion = $this->opinionRepo->find($id);
        $version = $this->versionRepo->find($id);

        $contribution = $opinion ?? $version;

        if (!$contribution->canContribute()) {
            throw new UserError('Uncontribuable opinion.');
        }

        $vote = $this->opinionVoteRepo->findOneBy(['user' => $viewer, 'opinion' => $opinion]);

        if (!$vote) {
            $vote = $this->versionVoteRepo->findOneBy([
                'user' => $viewer,
                'opinionVersion' => $opinion,
            ]);
        }

        if (!$vote) {
            throw new UserError('You have not voted for this opinion.');
        }
        // $opinion->decrementVotesCountByType($vote->getValue());

        $this->em->remove($vote);
        $this->em->flush();

        $this->redisStorageHelper->recomputeUserCounters($viewer);

        return ['contribution' => $contribution, 'viewer' => $viewer];
    }
}
