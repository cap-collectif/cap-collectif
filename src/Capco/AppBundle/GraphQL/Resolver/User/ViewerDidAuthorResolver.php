<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ViewerDidAuthorResolver implements ResolverInterface
{
    public function __invoke(Authorable $entity, User $viewer): bool
    {
        return $entity->getAuthor() === $viewer;
    }
}
