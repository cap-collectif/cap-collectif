<?php

namespace Capco\AppBundle\GraphQL\Resolver\Query;

use Capco\AppBundle\Enum\AvailableProposalCategoryColor;
use Capco\AppBundle\Enum\AvailableProposalCategoryIcon;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalCategoryOptionsResolver implements QueryInterface
{
    public function __invoke(): array
    {
        return [
            'colors' => AvailableProposalCategoryColor::getAvailableTypes(),
            'icons' => AvailableProposalCategoryIcon::getAvailableTypes(),
        ];
    }
}
