<?php

namespace Capco\AppBundle\GraphQL\Resolver\CollectStep;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class CollectStepViewerProposalDraftResolver implements ResolverInterface
{
    use ResolverTrait;

    private $proposalFormRepository;
    private $proposalRepository;
    private $builder;

    public function __construct(
        ProposalFormRepository $proposalFormRepository,
        ProposalRepository $proposalRepository,
        ConnectionBuilder $builder
    ) {
        $this->proposalFormRepository = $proposalFormRepository;
        $this->proposalRepository = $proposalRepository;
        $this->builder = $builder;
    }

    public function __invoke(CollectStep $step, $viewer, Argument $args): ConnectionInterface
    {
        $viewer = $this->preventNullableViewer($viewer);
        $proposalForm = $this->proposalFormRepository->findOneBy([
            'step' => $step->getId()
        ]);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form for step "%d"', $step->getId()));
        }

        $proposals = $this->proposalRepository->findBy([
            'draft' => true,
            'deletedAt' => null,
            'author' => $viewer,
            'proposalForm' => $proposalForm
        ]);

        $connection = $this->builder->connectionFromArray($proposals, $args);
        $connection->setTotalCount(\count($proposals));
        $connection->{'fusionCount'} = 0;

        return $connection;
    }
}
