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
        if ($order === 'ALPHABETICAL') {
            return usort($form->getDistricts()->toArray(), function ($a, $b) {
                return $a->getName() <=> $b->getName();
            });
        }

        return $form->getDistricts()->toArray();
    }
}
