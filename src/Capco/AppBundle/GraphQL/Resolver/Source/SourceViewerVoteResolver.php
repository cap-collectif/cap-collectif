<?php
namespace Capco\AppBundle\GraphQL\Resolver\Source;

use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Repository\SourceVoteRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Capco\AppBundle\Entity\SourceVote;

class SourceViewerVoteResolver implements ResolverInterface
{
    private $sourceVoteRepository;

    public function __construct(SourceVoteRepository $sourceVoteRepository)
    {
        $this->sourceVoteRepository = $sourceVoteRepository;
    }

    public function __invoke(Source $source, User $user): ?SourceVote
    {
        return $this->sourceVoteRepository->getBySourceAndUser($source, $user);
    }
}
