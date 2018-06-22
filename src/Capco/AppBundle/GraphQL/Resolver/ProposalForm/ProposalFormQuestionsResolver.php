<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Doctrine\Common\Collections\Collection;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalFormQuestionsResolver implements ResolverInterface
{
    public function __invoke(ProposalForm $form): Collection
    {
        return $form->getRealQuestions();
    }
}
