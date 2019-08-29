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
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class CollectStepViewerProposalDraftResolver implements ResolverInterface
{
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

    public function __invoke(CollectStep $step, User $user, Argument $args): Connection
    {
        $proposalForm = $this->proposalFormRepository->findOneBy([
            'step' => $step->getId()
        ]);

        if (!$proposalForm) {
            throw new UserError(sprintf('Unknown proposal form for step "%d"', $step->getId()));
        }

        $proposals = $this->proposalRepository->findBy([
            'draft' => true,
            'deletedAt' => null,
            'author' => $user,
            'proposalForm' => $proposalForm
        ]);

        $connection = $this->builder->connectionFromArray($proposals, $args);
        $connection->setTotalCount(\count($proposals));
        $connection->{'fusionCount'} = 0;

        return $connection;
    }
}
