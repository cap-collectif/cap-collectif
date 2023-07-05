<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\DBAL\Enum\ProposalRevisionStateType;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Repository\ProposalRevisionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class ProposalRevisionsResolver implements ResolverInterface
{
    private ProposalRevisionRepository $proposalRevisionRepository;
    private LoggerInterface $logger;

    public function __construct(
        ProposalRevisionRepository $proposalRevisionRepository,
        LoggerInterface $logger
    ) {
        $this->proposalRevisionRepository = $proposalRevisionRepository;
        $this->logger = $logger;
    }

    public function __invoke(Proposal $proposal, Argument $args): ConnectionInterface
    {
        try {
            $totalCount = 0;
            $paginator = new Paginator(function (int $offset, int $limit) use (
                $proposal,
                $args,
                &$totalCount
            ) {
                $state = null;
                $expiresAt = null;
                $state = $args->offsetExists('state') ? $args->offsetGet('state') : null;
                $proposalRevisions = null;
                if (!$state) {
                    $totalCount = $this->proposalRevisionRepository->countByProposal($proposal);
                    if (0 === $offset && 0 === $limit) {
                        return [];
                    }

                    return $this->proposalRevisionRepository
                        ->getRevisionsByProposalPaginated($proposal, $offset, $limit)
                        ->getIterator()
                        ->getArrayCopy()
                    ;
                }

                if (ProposalRevisionStateType::PENDING === $state) {
                    $totalCount = $this->proposalRevisionRepository->countForProposalWithRevisionsInPendingNotExpired(
                        $proposal
                    );
                    if (0 === $offset && 0 === $limit) {
                        return [];
                    }

                    return $this->proposalRevisionRepository
                        ->findRevisionsPaginatedInPendingNotExpired($proposal, $offset, $limit)
                        ->getIterator()
                        ->getArrayCopy()
                    ;
                }
                if (ProposalRevisionStateType::EXPIRED === $state) {
                    $state = ProposalRevisionStateType::PENDING;
                    $expiresAt = new \DateTime('now');
                }
                $totalCount = $this->proposalRevisionRepository->countForProposalByStateAndExpireBefore(
                    $proposal,
                    $state,
                    $expiresAt
                );
                if (0 === $offset && 0 === $limit) {
                    return [];
                }

                $proposalRevisions = $this->proposalRevisionRepository->findByStateAndExpireBefore(
                    $proposal,
                    $state,
                    $expiresAt,
                    $offset,
                    $limit
                );

                return $proposalRevisions->getIterator()->getArrayCopy();
            });

            $connection = $paginator->auto($args, $totalCount);
            $connection->setTotalCount($totalCount);

            return $connection;
        } catch (\RuntimeException $exception) {
            $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

            throw new \RuntimeException('Could not find proposal');
        }
    }
}
