<?php

namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\SourceVote;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class SourceViewerVoteResolver implements QueryInterface
{
    use ResolverTrait;

    private $sourceVoteRepository;

    public function __construct(SourceVoteRepository $sourceVoteRepository)
    {
        $this->sourceVoteRepository = $sourceVoteRepository;
    }

    public function __invoke(Source $source, $viewer): ?SourceVote
    {
        $viewer = $this->preventNullableViewer($viewer);

        return $this->sourceVoteRepository->getBySourceAndUser($source, $viewer);
    }
}
