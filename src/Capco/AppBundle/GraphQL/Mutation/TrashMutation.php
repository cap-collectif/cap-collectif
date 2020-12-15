<?php

namespace Capco\AppBundle\GraphQL\Mutation;

use Capco\AppBundle\Entity\Interfaces\Trashable;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\UserBundle\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class TrashMutation implements MutationInterface
{
    public const TRASHABLE_NOT_FOUND = 'TRASHABLE_NOT_FOUND';

    private GlobalIdResolver $globalIdResolver;
    private EntityManagerInterface $em;

    public function __construct(GlobalIdResolver $globalIdResolver, EntityManagerInterface $em)
    {
        $this->globalIdResolver = $globalIdResolver;
        $this->em = $em;
    }

    public function __invoke(Arg $input, User $viewer): array
    {
        try {
            $trashable = $this->getTrashable($input, $viewer);
            self::trash($trashable, $input);
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

    private static function trash(Trashable $trashable, Arg $input): Trashable
    {
        $trashable->setTrashedStatus($input->offsetGet('trashedStatus'));
        $trashable->setTrashedReason(strip_tags($input->offsetGet('trashedReason')));

        return $trashable;
    }
}
