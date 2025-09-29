<?php

namespace Capco\AppBundle\GraphQL\Resolver\ConsultationStep;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\ArgumentVoteRepository;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\UserBundle\Repository\UserRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class ConsultationStepUserHasVoteResolver implements QueryInterface
{
    public function __construct(
        private readonly UserRepository $userRepo,
        private readonly OpinionVoteRepository $opinionVoteRepo,
        private readonly ArgumentVoteRepository $argumentVoteRepo,
        private readonly SourceVoteRepository $sourceVoteRepo,
        private readonly OpinionVersionVoteRepository $versionVoteRepo,
        private readonly LoggerInterface $logger
    ) {
    }

    public function __invoke(ConsultationStep $step, Argument $args): bool
    {
        $user = $this->userRepo->findOneByEmail($args->offsetGet('login'));

        if (!$user) {
            $this->logger->warning(self::class . ' : Could not find user.');

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
