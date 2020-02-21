<?php

namespace Capco\AppBundle\GraphQL\Resolver\User;

use Capco\UserBundle\Entity\User;
use Capco\AppBundle\Entity\Interfaces\Authorable;
use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ViewerDidAuthorResolver implements ResolverInterface
{
    use ResolverTrait;

    public function __invoke(Authorable $entity, $viewer): bool
    {
        $viewer = $this->preventNullableViewer($viewer);
        
        return $entity->getAuthor() === $viewer;
    }
}
