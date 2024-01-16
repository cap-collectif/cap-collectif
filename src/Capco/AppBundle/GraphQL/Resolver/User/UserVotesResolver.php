<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Elasticsearch\ElasticsearchPaginator;
use Capco\AppBundle\Search\VoteSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\ConnectionInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserVotesResolver implements QueryInterface
{
    private VoteSearch $voteSearch;

    public function __construct(VoteSearch $voteSearch)
    {
        $this->voteSearch = $voteSearch;
    }

    public function __invoke(
        $viewer,
        User $user,
        ?Argument $args = null,
        ?\ArrayObject $context = null
    ): ConnectionInterface {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        $onlyAccounted = true === $args->offsetGet('onlyAccounted');
        $contribuableId = $args->offsetGet('contribuableId');
        $aclDisabled =
            $context
            && $context->offsetExists('disable_acl')
            && true === $context->offsetGet('disable_acl');
        $validViewer = $viewer instanceof UserInterface;

        $paginator = new ElasticsearchPaginator(function (?string $cursor, int $limit) use (
            $contribuableId,
            $aclDisabled,
            $user,
            $onlyAccounted,
            $validViewer,
            $viewer
        ) {
            if ($aclDisabled) {
                return $this->voteSearch->getVotesByUser($user, $limit, $cursor, $onlyAccounted);
            }
            if ($validViewer && $viewer) {
                return $this->voteSearch->getVotesByAuthorViewerCanSee(
                    $user,
                    $viewer,
                    $contribuableId,
                    $limit,
                    $cursor,
                    $onlyAccounted
                );
            }

            return $this->voteSearch->getPublicVotesByAuthor(
                $user,
                $limit,
                $cursor,
                $onlyAccounted
            );
        });

        return $paginator->auto($args);
    }

    /**
     * A small function just for twig.
     * Do not use it.
     *
     * @param mixed $viewer
     */
    public function getAccountedVotes($viewer, User $user)
    {
        return $this->__invoke(
            $viewer,
            $user,
            new Argument(['first' => 0, 'onlyAccounted' => true])
        );
    }
}
