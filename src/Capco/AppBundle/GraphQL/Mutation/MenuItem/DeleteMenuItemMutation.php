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

class DeleteMenuItemMutation implements MutationInterface
{
    use MutationTrait;

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly MenuItemRepository $menuItemRepository
    ) {
    }

    /**
     * @return array{deletedMenuItemId: ?string, errorCode: ?string}
     */
    public function __invoke(Argument $input): array
    {
        $this->formatInput($input);

        $id = (string) $input->offsetGet('id');
        $menuItem = $this->menuItemRepository->find(GlobalIdResolver::getDecodedId($id, true));
        if (!$menuItem instanceof MenuItem) {
            return ['deletedMenuItemId' => null, 'errorCode' => MenuItemErrorCode::NOT_FOUND];
        }
        // Items created by default on every platform must be kept
        if (!$menuItem->getIsDeletable()) {
            return ['deletedMenuItemId' => null, 'errorCode' => MenuItemErrorCode::NOT_DELETABLE];
        }

        $this->em->remove($menuItem);
        $this->em->flush();

        return ['deletedMenuItemId' => $id, 'errorCode' => null];
    }
}
