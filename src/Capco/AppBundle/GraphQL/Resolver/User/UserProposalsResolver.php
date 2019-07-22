<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;

class UserProposalsResolver implements ResolverInterface
{
    private $proposalRepository;

    public function __construct(ProposalRepository $proposalRepository)
    {
        $this->proposalRepository = $proposalRepository;
    }

    public function __invoke($viewer, User $user, Argument $args = null): Connection
    {
        if (!$args) {
            $args = new Argument(['first' => 100]);
        }
        if ($viewer) {
            /** @var User $viewer */
            $paginator = new Paginator(function (int $offset, int $limit) use ($viewer, $user) {
                return $this->proposalRepository->getProposalsByAuthorViewerCanSee(
                    $viewer,
                    $user,
                    $limit,
                    $offset
                );
            });
            $totalCount = $this->proposalRepository->countProposalsViewerCanSee($viewer, $user);
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
