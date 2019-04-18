<?php

namespace Capco\AppBundle\GraphQL\Resolver\ConsultationStep;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class ConsultationStepUserHasVoteResolver implements ResolverInterface
{
    private $userRepo;
    private $opinionVoteRepo;
    private $argumentVoteRepo;
    private $sourceVoteRepo;
    private $versionVoteRepo;
    private $logger;

    public function __construct(
        UserRepository $userRepo,
        OpinionVoteRepository $opinionVoteRepo,
        ArgumentVoteRepository $argumentVoteRepo,
        SourceVoteRepository $sourceVoteRepo,
        OpinionVersionVoteRepository $versionVoteRepo,
        LoggerInterface $logger
    ) {
        $this->userRepo = $userRepo;
        $this->opinionVoteRepo = $opinionVoteRepo;
        $this->argumentVoteRepo = $argumentVoteRepo;
        $this->sourceVoteRepo = $sourceVoteRepo;
        $this->versionVoteRepo = $versionVoteRepo;
        $this->logger = $logger;
    }

    public function __invoke(ConsultationStep $step, Argument $args): bool
    {
        $user = $this->userRepo->findOneByEmail($args->offsetGet('login'));

        if (!$user) {
            $this->logger->warning(__CLASS__ . ' : Could not find user.');

            return false;
        }

        $votesCount = 0;
        $votesCount += $this->opinionVoteRepo->countByAuthorAndStep($user, $step);
        $votesCount += $this->argumentVoteRepo->countByAuthorAndStep($user, $step);
        $votesCount += $this->sourceVoteRepo->countByAuthorAndStep($user, $step);
        $votesCount += $this->versionVoteRepo->countByAuthorAndStep($user, $step);

        return $votesCount > 0;
    }
}
