<?php

namespace Capco\AppBundle\GraphQL\Resolver\CollectStep;

use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Filter\ContributionCompletionStatusFilter;
use Capco\AppBundle\GraphQL\ConnectionBuilderInterface;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalFormRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Error\UserError;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class CollectStepViewerProposalDraftResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(
        private ProposalFormRepository $proposalFormRepository,
        private ProposalRepository $proposalRepository,
        private readonly ConnectionBuilderInterface $builder,
        private readonly EntityManagerInterface $entityManager
    ) {}

    public function __invoke(CollectStep $step, $viewer, Argument $args): ConnectionInterface
    {
        $viewer = $this->preventNullableViewer($viewer);
        $proposalForm = $this->proposalFormRepository->findOneBy([
            'step' => $step->getId(),
        ]);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form for step "%d"', $step->getId()));
        }

        $filters = $this->entityManager->getFilters();
        $wasEnabled = $filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME);
        if ($wasEnabled) {
            $filters->disable(ContributionCompletionStatusFilter::FILTER_NAME);
        }

        try {
            $proposals = $this->proposalRepository->findBy([
                'draft' => true,
                'deletedAt' => null,
                'author' => $viewer,
                'proposalForm' => $proposalForm,
            ]);
        } finally {
            if ($wasEnabled) {
                $filters->enable(ContributionCompletionStatusFilter::FILTER_NAME);
            }
        }

        $connection = $this->builder->connectionFromArray($proposals, $args);
        $connection->setTotalCount(\count($proposals));
        $connection->{'fusionCount'} = 0;

        return $connection;
    }
}
