<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalFormCategoriesResolver implements ResolverInterface
{
    public function __invoke(ProposalForm $form, ?string $order): array
    {
        $categories = $form->getCategories()->toArray();
        if ('ALPHABETICAL' === $order) {
            usort($categories, function ($a, $b) {
                return $a->getName() <=> $b->getName();
            });
        }

        return $categories;
    }
}
