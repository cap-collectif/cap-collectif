<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Relay\Connection\Output\Connection;
use Overblog\GraphQLBundle\Relay\Connection\Paginator;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class UserMediasResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function __invoke(User $user, Argument $args): Connection
    {
        $medias = [];
        if (null !== $user->getMedia()) {
            $medias[] = $user->getMedia();
        }

        $proposalRepository = $this->container->get('capco.proposal.repository');
        $proposals = $proposalRepository->findBy(['author' => $user]);

        foreach ($proposals as $proposal) {
            if (null !== $proposal->getMedia()) {
                $medias[] = $proposal->getMedia();
            }
        }

        $paginator = new Paginator(function (int $offset, int $limit) use ($medias) {
            return $medias;
        });

        $totalCount = 0;

        return $paginator->auto($args, $totalCount);
    }
}
