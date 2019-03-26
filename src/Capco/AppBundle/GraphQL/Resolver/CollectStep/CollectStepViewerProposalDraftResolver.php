<?php

namespace Capco\AppBundle\GraphQL\Resolver\CollectStep;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Output\ConnectionBuilder;

class CollectStepViewerProposalDraftResolver implements ResolverInterface
{
    private $proposalFormRepository;
    private $proposalRepository;

    public function __construct(
        ProposalFormRepository $proposalFormRepository,
        ProposalRepository $proposalRepository
    ) {
        $this->proposalFormRepository = $proposalFormRepository;
        $this->proposalRepository = $proposalRepository;
    }

    public function __invoke(CollectStep $step, User $user, Argument $args): Connection
    {
        $proposalForm = $this->proposalFormRepository->findOneBy([
            'step' => $step->getId(),
        ]);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form for step "%d"', $step->getId()));
        }

        $proposals = $this->proposalRepository->findBy([
            'draft' => true,
            'deletedAt' => null,
            'author' => $user,
            'proposalForm' => $proposalForm,
        ]);

        $connection = ConnectionBuilder::connectionFromArray($proposals, $args);
        $connection->totalCount = \count($proposals);
        $connection->{'fusionCount'} = 0;

        return $connection;
    }
}
