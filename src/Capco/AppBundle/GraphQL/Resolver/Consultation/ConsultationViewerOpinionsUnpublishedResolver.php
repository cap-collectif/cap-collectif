<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\GraphQL\ConnectionBuilder;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;

class ConsultationViewerOpinionsUnpublishedResolver implements QueryInterface
{
    use ResolverTrait;

    public function __construct(private OpinionRepository $opinionRepo, private ConnectionBuilder $builder)
    {
    }

    public function __invoke(
        Consultation $consultation,
        Argument $args,
        $viewer
    ): ConnectionInterface {
        $viewer = $this->preventNullableViewer($viewer);
        $unpublished = $this->opinionRepo->getUnpublishedByConsultationAndAuthor(
            $consultation,
            $viewer
        );
        $connection = $this->builder->connectionFromArray($unpublished, $args);
        $connection->setTotalCount(\count($unpublished));

        return $connection;
    }
}
