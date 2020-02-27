<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\ProposalSupervisor;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalSupervisorRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Psr\Log\LoggerInterface;

class UserSupervisedProposalsResolver implements ResolverInterface
{
    use ResolverTrait;

    private $proposalSupervisorRepository;

    private $logger;

    public function __construct(
        ProposalSupervisorRepository $proposalSupervisorRepository,
        LoggerInterface $logger
    ) {
        $this->proposalSupervisorRepository = $proposalSupervisorRepository;
        $this->logger = $logger;
    }

    public function __invoke($viewer, Argument $args): ConnectionInterface
    {
        if (!$args) {
            $args = new Argument([
                'first' => 0
            ]);
        }

        $viewer = $this->preventNullableViewer($viewer);

        $paginator = new Paginator(function (int $offset, int $limit) use ($viewer) {
            $supervisedProposals = [];

            try {
                $proposalSupervisors = $this->proposalSupervisorRepository->findBySupervisor(
                    $viewer,
                    ['createdAt' => 'DESC'],
                    $limit,
                    $offset
                );
                if (!empty($proposalSupervisors)) {
                    /** @var ProposalSupervisor $proposalSupervisor */
                    foreach ($proposalSupervisors as $proposalSupervisor) {
                        $supervisedProposals[] = $proposalSupervisor->getProposal();
                    }
                }
            } catch (\RuntimeException $exception) {
                $this->logger->error(__METHOD__ . ' : ' . $exception->getMessage());

                throw new UserError(
                    'Error during fetching supervised proposals of ' . $viewer->getLastname()
                );
            }

            return $supervisedProposals;
        });

        $totalCount = $this->proposalSupervisorRepository->count(['supervisor' => $viewer]);

        return $paginator->auto($args, $totalCount);
    }
}
