<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Entity\UserInvite;
use Capco\AppBundle\Repository\UserInviteRepository;
use Capco\AppBundle\Search\UserSearch;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class UserSearchQueryResolver implements ResolverInterface
{
    private UserSearch $userSearch;
    private UserInviteRepository $userInviteRepository;

    public function __construct(UserSearch $userSearch, UserInviteRepository $userInviteRepository)
    {
        $this->userSearch = $userSearch;
        $this->userInviteRepository = $userInviteRepository;
    }

    public function __invoke(Argument $args): array
    {
        $users = $this->userSearch->searchAllUsers(
            $args['displayName'],
            $args['notInIds'],
            $args['authorsOfEventOnly'],
            true
        );

        /** @var UserInvite $userInvite */
        if (
            $userInvite = $this->userInviteRepository->findOneByStatusSentOrNotExpired(
                $args['displayName']
            )
        ) {
            $user = (new User())->setEmail($userInvite->getEmail());
            $users[] = $user;
        }

        return $users;
    }
}
