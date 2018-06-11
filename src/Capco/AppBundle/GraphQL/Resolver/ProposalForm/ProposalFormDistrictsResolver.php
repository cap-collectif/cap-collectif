<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalFormDistrictsResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveDistricts(ProposalForm $form, string $order): array
    {
        $districts = $form->getDistricts()->toArray();
        if ('ALPHABETICAL' === $order) {
            usort(
                $districts,
                function ($a, $b) {
                    return $a->getName() <=> $b->getName();
                }
            );
        }

        return $districts;
    }
}
