<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Enum\AvailableProposalCategoryColor;
use Capco\AppBundle\Enum\AvailableProposalCategoryIcon;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalCategoryOptionsResolver implements ResolverInterface
{

    public function __invoke(): array
    {
        return [
            'colors' => AvailableProposalCategoryColor::getAvailableTypes(),
            'icons' => AvailableProposalCategoryIcon::getAvailableTypes()
        ];
    }
}
