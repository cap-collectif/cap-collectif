<?php
namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\UserBundle\Entity\User;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;
use Overblog\GraphQLBundle\Error\UserError;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;

class ConsultationUserHasVoteResolver implements ResolverInterface
{
    private $userRepo;
    private $opinionVoteRepo;
    private $argumentVoteRepo;
    private $sourceVoteRepo;
    private $versionVoteRepo;

    public function __construct(
        UserRepository $userRepo,
        OpinionVoteRepository $opinionVoteRepo,
        ArgumentVoteRepository $argumentVoteRepo,
        SourceVoteRepository $sourceVoteRepo,
        OpinionVersionVoteRepository $versionVoteRepo
    ) {
        $this->userRepo = $userRepo;
        $this->opinionVoteRepo = $opinionVoteRepo;
        $this->argumentVoteRepo = $argumentVoteRepo;
        $this->sourceVoteRepo = $sourceVoteRepo;
        $this->versionVoteRepo = $versionVoteRepo;
    }

    public function __invoke(ConsultationStep $step, Argument $args): bool
    {
        $user = $this->userRepo->findOneByEmail($args->offsetGet('login'));
        if (!$user) {
            throw new UserError('Could not find user.');
        }

        $votesCount = 0;
        $votesCount += $this->opinionVoteRepo->countByAuthorAndStep($user, $step);
        $votesCount += $this->argumentVoteRepo->countByAuthorAndStep($user, $step);
        $votesCount += $this->sourceVoteRepo->countByAuthorAndStep($user, $step);
        $votesCount += $this->versionVoteRepo->countByAuthorAndStep($user, $step);

        return $votesCount > 0;
    }
}
