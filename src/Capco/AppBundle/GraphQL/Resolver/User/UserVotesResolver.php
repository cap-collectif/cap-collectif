<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\VoteSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserVotesResolver implements ResolverInterface
{
    private $voteSearch;

    public function __construct(VoteSearch $voteSearch)
    {
        $this->voteSearch = $voteSearch;
    }

    public function __invoke(
        $viewer,
        User $user,
        Argument $args = null,
        ?\ArrayObject $context = null
    ): ConnectionInterface {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        $aclDisabled =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        $validViewer = $viewer instanceof UserInterface;

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $aclDisabled,
            $user,
            $validViewer,
            $viewer
        ) {
            if ($aclDisabled) {
                return $this->voteSearch->getVotesByUser($user, $limit, $cursor);
            }
            if ($validViewer && $viewer) {
                return $this->voteSearch->getVotesByAuthorViewerCanSee(
                    $user,
                    $viewer,
                    $limit,
                    $cursor
                );
            }

            return $this->voteSearch->getPublicVotesByAuthor($user, $limit, $cursor);
        });

        return $paginator->auto($args);
    }
}
