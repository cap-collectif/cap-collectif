<?php
namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalFormViewerCanContributeResolver implements ResolverInterface
{
    public function __invoke(ProposalForm $form, $user = null): bool
    {
        return $form->canContribute($user);
    }
}
