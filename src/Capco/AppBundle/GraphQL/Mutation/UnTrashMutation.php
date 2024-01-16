<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UnTrashMutation implements MutationInterface
{
    use MutationTrait;

    public const TRASHABLE_NOT_FOUND = 'TRASHABLE_NOT_FOUND';
    public const NOT_TRASHED = 'NOT_TRASHED';

    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;

    public function __construct(GlobalIdResolver $globalIdResolver, EntityManagerInterface $em)
    {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        $this->formatInput($input);

        try {
            $trashable = $this->getTrashable($input, $viewer);
            self::checkIsTrashed($trashable);
            self::unTrash($trashable);
            $this->em->flush();

            return ['trashable' => $trashable];
        } catch (UserError $error) {
            return ['errorCode' => $error->getMessage()];
        }
    }

    private function getTrashable(Arg $input, User $viewer): Trashable
    {
        $trashable = $this->globalIdResolver->resolve($input->offsetGet('id'), $viewer);
        if (!($trashable instanceof Trashable)) {
            throw new UserError(self::TRASHABLE_NOT_FOUND);
        }

        return $trashable;
    }

    private static function checkIsTrashed(Trashable $trashable): void
    {
        if (!$trashable->isTrashed()) {
            throw new UserError(self::NOT_TRASHED);
        }
    }

    private static function unTrash(Trashable $trashable): Trashable
    {
        $trashable->setTrashedStatus(null);

        return $trashable;
    }
}
