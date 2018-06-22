<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Utils\Text;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;

class ProposalFormSummaryHelpTextResolver implements ResolverInterface
{
    public function __invoke(ProposalForm $proposalForm): ?string
    {
        $text = $proposalForm->getSummaryHelpText();

        return $text ? Text::htmlToString($text) : null;
    }
}
