<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ProposalFormViewerProposalsUnpublishedResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private ProposalRepository $proposalRepo, private ConnectionBuilder $builder)
    {
    }

    public function __invoke(ProposalForm $form, Arg $args, $viewer): ConnectionInterface
    {
        $viewer = $this->preventNullableViewer($viewer);
        $proposals = $this->proposalRepo->getUnpublishedByFormAndAuthor($form, $viewer);

        $connection = $this->builder->connectionFromArray($proposals, $args);
        $connection->setTotalCount(\count($proposals));

        return $connection;
    }
}
