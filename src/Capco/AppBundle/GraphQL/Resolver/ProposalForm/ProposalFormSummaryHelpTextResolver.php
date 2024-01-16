<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Utils\Text;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;

class ProposalFormSummaryHelpTextResolver implements QueryInterface
{
    public function __invoke(ProposalForm $proposalForm): ?string
    {
        $text = $proposalForm->getSummaryHelpText();

        return $text ? Text::htmlToString($text) : null;
    }
}
