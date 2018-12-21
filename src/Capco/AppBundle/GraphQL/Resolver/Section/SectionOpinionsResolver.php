<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Psr\Log\LoggerInterface;
use Capco\AppBundle\Entity\OpinionType;
use Overblog\GraphQLBundle\Definition\Argument;
use Capco\AppBundle\Repository\OpinionRepository;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class SectionOpinionsResolver implements ResolverInterface
{
    private $logger;
    private $opinionRepo;

    public function __construct(OpinionRepository $opinionRepo, LoggerInterface $logger)
    {
        $this->logger = $logger;
        $this->opinionRepo = $opinionRepo;
    }

    public function __invoke(OpinionType $section, Argument $args): array
    {
        if (0 === $section->getOpinions()->count()) {
            return [];
        }

        $limit = $args->offsetGet('limit');

        return $this->opinionRepo
            ->getByOpinionTypeOrdered($section->getId(), $limit, 1, $section->getDefaultFilter())
            ->getIterator()
            ->getArrayCopy();
    }
}
