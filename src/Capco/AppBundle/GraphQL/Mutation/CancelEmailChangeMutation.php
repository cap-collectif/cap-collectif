<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\GraphQL\Resolver\Traits\ResolverTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;

class CancelEmailChangeMutation implements MutationInterface
{
    use ResolverTrait;

    public function __construct(private readonly EntityManagerInterface $em)
    {
    }

    public function __invoke($user): array
    {
        $user = $this->preventNullableViewer($user);

        $user->setNewEmailToConfirm(null);
        $user->setNewEmailConfirmationToken(null);
        $this->em->flush();

        return ['success' => true];
    }
}
