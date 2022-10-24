<?php

namespace Capco\AppBundle\GraphQL\Resolver\Dev;

use Capco\UserBundle\Entity\User;

class ExampleFakeResolver extends AbstractFakeResolver
{
    public function __invoke(): array
    {
        return $this->getFromClass(User::class, 10);
    }
}
