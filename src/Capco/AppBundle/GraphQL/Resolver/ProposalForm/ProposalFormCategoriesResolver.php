<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Enum\CategoryOrderField;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalFormCategoriesResolver implements QueryInterface
{
    public function __invoke(ProposalForm $form, ?string $order): array
    {
        $categories = $form->getCategories()->toArray();
        if (CategoryOrderField::ALPHABETICAL === $order) {
            usort($categories, fn ($a, $b) => $a->getName() <=> $b->getName());
        }

        return $categories;
    }
}
