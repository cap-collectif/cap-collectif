<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Repository\ProposalRepository;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class ProposalFormViewerProposalsUnpublishedResolver implements ResolverInterface
{
    use ResolverTrait;

    private $proposalRepo;
    private $builder;

    public function __construct(ProposalRepository $proposalRepo, ConnectionBuilder $builder)
    {
        $this->proposalRepo = $proposalRepo;
        $this->builder = $builder;
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
