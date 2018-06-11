<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Utils\Text;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalFormSummaryHelpTextResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

    public function __invoke(ProposalForm $proposalForm): ?string
    {
        $text = $proposalForm->getSummaryHelpText();

        return $text ? Text::htmlToString($text) : null;
    }
}
