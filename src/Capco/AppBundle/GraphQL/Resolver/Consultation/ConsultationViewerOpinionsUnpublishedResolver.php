<?php

namespace Capco\AppBundle\GraphQL\Resolver\Consultation;

use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Repository\OpinionRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Capco\AppBundle\GraphQL\ConnectionBuilder;

class ConsultationViewerOpinionsUnpublishedResolver implements ResolverInterface
{
    private $opinionRepo;

    public function __construct(OpinionRepository $opinionRepo)
    {
        $this->opinionRepo = $opinionRepo;
    }

    public function __invoke(ConsultationStep $step, Argument $args, $viewer): Connection
    {
        if (!$viewer instanceof User) {
            return ConnectionBuilder::empty();
        }
        $unpublished = $this->opinionRepo->getUnpublishedByConsultationAndAuthor($step, $viewer);
        $connection = ConnectionBuilder::connectionFromArray($unpublished, $args);
        $connection->totalCount = \count($unpublished);

        return $connection;
    }
}
