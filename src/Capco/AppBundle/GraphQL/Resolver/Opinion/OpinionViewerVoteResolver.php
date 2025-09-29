<?php

namespace Capco\AppBundle\GraphQL\Resolver\Opinion;

use Capco\AppBundle\Entity\AbstractVote;
use Capco\AppBundle\Entity\Interfaces\OpinionContributionInterface;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\OpinionVersionVoteRepository;
use Capco\AppBundle\Repository\OpinionVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Psr\Log\LoggerInterface;

class OpinionViewerVoteResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private OpinionVoteRepository $opinionVoteRepository,
        private OpinionVersionVoteRepository $versionVoteRepository,
        private LoggerInterface $logger
    ) {
    }

    public function __invoke(OpinionContributionInterface $contribution, $viewer): ?AbstractVote
    {
        $viewer = $this->preventNullableViewer($viewer);

        try {
            if ($contribution instanceof Opinion) {
                return $this->opinionVoteRepository->getByAuthorAndOpinion($viewer, $contribution);
            }
            if ($contribution instanceof OpinionVersion) {
                return $this->versionVoteRepository->getByAuthorAndOpinion($viewer, $contribution);
            }

            return null;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException($exception->getMessage());
        }
    }
}
