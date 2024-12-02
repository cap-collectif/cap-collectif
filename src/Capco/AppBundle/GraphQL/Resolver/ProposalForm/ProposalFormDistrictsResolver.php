<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalFormDistrictsResolver implements QueryInterface
{
    public function __invoke(ProposalForm $form, ?string $order): array
    {
        $districts = $form->getDistricts()->toArray();
        if ('ALPHABETICAL' === $order) {
            usort($districts, fn ($a, $b) => $a->getName() <=> $b->getName());
        }

        return $districts;
    }
}
