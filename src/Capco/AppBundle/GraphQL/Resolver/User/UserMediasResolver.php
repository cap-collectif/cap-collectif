<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Repository\ProposalRepository;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class UserMediasResolver implements QueryInterface
{
    protected $proposalRepo;

    public function __construct(ProposalRepository $proposalRepo)
    {
        $this->proposalRepo = $proposalRepo;
    }

    public function __invoke(User $user, Argument $args): array
    {
        $medias = [];
        if (null !== $user->getMedia()) {
            $medias[] = $user->getMedia();
        }

        $proposals = $this->proposalRepo->findBy(['author' => $user]);

        foreach ($proposals as $proposal) {
            if (null !== $proposal->getMedia()) {
                $medias[] = $proposal->getMedia();
            }
        }

        return $medias;
    }
}
