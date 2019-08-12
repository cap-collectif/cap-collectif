<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use ArrayObject;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\Security\Core\User\UserInterface;

class UserProposalsResolver implements ResolverInterface
{
    private $proposalRepository;

    public function __construct(ProposalRepository $proposalRepository)
    {
        $this->proposalRepository = $proposalRepository;
    }

    public function __invoke(
        $viewer,
        User $user,
        Argument $args = null,
        ?ArrayObject $context = null
    ): Connection {
        if (!$args) {
            $args = new Argument(['first' => 0]);
        }

        $aclDisabled =
            $context &&
            $context->offsetExists('disable_acl') &&
            true === $context->offsetGet('disable_acl');
        $validViewer = $viewer instanceof UserInterface;

        if ($aclDisabled) {
            /** @var User $viewer */
            $paginator = new Paginator(function (int $offset, int $limit) use ($user) {
                return $this->proposalRepository->getByUser($user, $limit, $offset);
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
