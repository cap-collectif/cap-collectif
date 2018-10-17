<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalFormCategoriesResolver implements ResolverInterface
{
    public function __invoke(ProposalForm $form): array
    {
        $categories = $form->getCategories()->toArray();

        return $categories;
    }
}
