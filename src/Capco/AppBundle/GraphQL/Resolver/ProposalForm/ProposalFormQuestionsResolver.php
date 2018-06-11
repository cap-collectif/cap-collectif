<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalFormQuestionsResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function __invoke(ProposalForm $form): Collection
    {
        return $form->getRealQuestions();
    }
}
