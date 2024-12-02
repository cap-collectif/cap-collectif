<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use ArrayObject;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use GraphQL\Type\Definition\ResolveInfo;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\Security\Core\User\UserInterface;

class UserProposalsResolver implements QueryInterface
{
    public function __construct(private readonly ProposalRepository $proposalRepository)
    {
    }

    public function __invoke(
        $viewer,
        User $user,
        ?Argument $args = null,
        ?ArrayObject $context = null,
        ?ResolveInfo $resolveInfo = null
    ): Connection {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        $aclDisabled =
            $context
            && $context->offsetExists('disable_acl')
            && true === $context->offsetGet('disable_acl');
        $validViewer = $viewer instanceof UserInterface;

        // Sometimes we only use `totalCount` and we don't need to fetch edges.
        $needEdges = $resolveInfo ? isset($resolveInfo->getFieldSelection()['edges']) : false;

        if ($aclDisabled) {
            $paginator = new Paginator(function (int $offset, int $limit) use ($user, $needEdges) {
                return $needEdges
                    ? $this->proposalRepository->getByUser($user, $limit, $offset)
                    : [];
            });
            $totalCount = $this->proposalRepository->countByUser($user);
        } elseif ($validViewer && $user) {
            /** @var User $viewer */
            $paginator = new Paginator(function (int $offset, int $limit) use ($viewer, $user) {
                return $this->proposalRepository->getProposalsByAuthorViewerCanSee(
                    $viewer,
                    $user,
                    $limit,
                    $offset
                );
            });
            $totalCount = $this->proposalRepository->countProposalsByAuthorViewerCanSee(
                $viewer,
                $user
            );
        } else {
            /** @var User $viewer */
            $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
                return $this->proposalRepository->getPublicProposalsByAuthor(
                    $user,
                    $limit,
                    $offset
                );
            });
            $totalCount = $this->proposalRepository->countPublicProposalsByAuthor($user);
        }

        return $paginator->auto($args, $totalCount);
    }
}
