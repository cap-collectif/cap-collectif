<?php

namespace Capco\AppBundle\GraphQL\Mutation\MenuItem;

use Capco\AppBundle\Entity\MenuItem;
use Capco\AppBundle\Enum\MenuItemErrorCode;
use Capco\AppBundle\GraphQL\Resolver\GlobalIdResolver;
use Capco\AppBundle\GraphQL\Resolver\Traits\MutationTrait;
use Capco\AppBundle\Repository\MenuItemRepository;
use Doctrine\ORM\EntityManagerInterface;
use Overblog\GraphQLBundle\Definition\Argument;
use Overblog\GraphQLBundle\Definition\Resolver\MutationInterface;
use Overblog\GraphQLBundle\Error\UserError;

class UpdateMenuItemMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly MenuItemRepository $menuItemRepository,
        private readonly MenuItemInputApplier $inputApplier
    ) {
    }

    /**
     * @return array{menuItem: ?MenuItem, errorCode: ?string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $menuItem = $this->menuItemRepository->find(
            GlobalIdResolver::getDecodedId((string) $input->offsetGet('id'), true)
        );
        if (!$menuItem instanceof MenuItem) {
            return ['menuItem' => null, 'errorCode' => MenuItemErrorCode::NOT_FOUND];
        }

        try {
            $this->inputApplier->apply($menuItem, $input);
        } catch (UserError $error) {
            return ['menuItem' => null, 'errorCode' => $error->getMessage()];
        }
        // Timestampable only tracks some of the fields, so changes to translations or isEnabled are not dated
        $menuItem->setUpdatedAt(new \DateTime());

        $this->em->flush();

        return ['menuItem' => $menuItem, 'errorCode' => null];
    }
}
