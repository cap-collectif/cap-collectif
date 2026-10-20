<?php

namespace Capco\AppBundle\GraphQL\Mutation\MenuItem;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class CreateMenuItemMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly MenuItemInputApplier $inputApplier
    ) {
    }

    /**
     * @return array{menuItem: ?MenuItem, errorCode: ?string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $menuItem = new MenuItem();

        try {
            $this->inputApplier->apply($menuItem, $input);
        } catch (UserError $error) {
            return ['menuItem' => null, 'errorCode' => $error->getMessage()];
        }

        $this->em->persist($menuItem);
        $this->em->flush();

        return ['menuItem' => $menuItem, 'errorCode' => null];
    }
}
