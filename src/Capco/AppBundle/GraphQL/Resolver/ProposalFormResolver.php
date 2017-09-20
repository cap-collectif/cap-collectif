<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\ProposalForm;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalFormResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function resolveQuestions(ProposalForm $form)
    {
        return $form->getRealQuestions();
    }

    public function resolveDistricts(ProposalForm $form, string $order): array
    {
        $districts = $form->getDistricts()->toArray();
        if ($order === 'ALPHABETICAL') {
            usort($districts, function ($a, $b) {
                return $a->getName() <=> $b->getName();
            });
        }

        return $districts;
    }
}
