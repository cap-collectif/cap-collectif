<?php
namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Psr\Log\LoggerInterface;

class SourceViewerHasVoteResolver implements ResolverInterface
{
    private $sourceVoteRepository;

    public function __construct(SourceVoteRepository $sourceVoteRepository)
    {
        $this->sourceVoteRepository = $sourceVoteRepository;
    }

    public function __invoke(Source $source, User $user): bool
    {
        return $this->sourceVoteRepository->getBySourceAndUser($source, $user) !== null;
    }
}
