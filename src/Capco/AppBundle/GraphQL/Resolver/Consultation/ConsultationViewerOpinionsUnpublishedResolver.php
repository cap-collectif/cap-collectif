<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class ConsultationViewerOpinionsUnpublishedResolver implements ResolverInterface
{
    use ResolverTrait;

    private $opinionRepo;
    private $builder;

    public function __construct(OpinionRepository $opinionRepo, ConnectionBuilder $builder)
    {
        $this->opinionRepo = $opinionRepo;
        $this->builder = $builder;
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
