<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalFormViewerCanContributeResolver implements QueryInterface
{
    public function __invoke(ProposalForm $form, $user = null): bool
    {
        return $form->canContribute($user);
    }
}
