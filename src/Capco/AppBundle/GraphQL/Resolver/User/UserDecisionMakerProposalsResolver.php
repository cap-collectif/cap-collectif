<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\ProposalDecisionMaker;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalDecisionMakerRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class UserDecisionMakerProposalsResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private ProposalDecisionMakerRepository $proposalDecisionMakerRepository, private LoggerInterface $logger)
    {
    }

    public function __invoke($viewer, Argument $args): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0,
            ]);
        }

        $viewer = $this->preventNullableViewer($viewer);

        $paginator = new Paginator(function (int $offset, int $limit) use ($viewer) {
            $decisionMakerProposals = [];

            try {
                $proposalDecisionMakers = $this->proposalDecisionMakerRepository->findByDecisionMaker(
                    $viewer
                );
                if (!empty($proposalDecisionMakers)) {
                    /** @var ProposalDecisionMaker $proposalDecisionMaker */
                    foreach ($proposalDecisionMakers as $proposalDecisionMaker) {
                        $decisionMakerProposals[] = $proposalDecisionMaker->getProposal();
                    }
                }
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new UserError('Error during fetching supervised proposals of ' . $viewer->getLastname());
            }

            return $decisionMakerProposals;
        });

        $totalCount = $this->proposalDecisionMakerRepository->count(['decisionMaker' => $viewer]);

        return $paginator->auto($args, $totalCount);
    }
}
