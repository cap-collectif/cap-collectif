<?php

namespace Capco\AppBundle\GraphQL\Resolver;

use Capco\AppBundle\Entity\Interfaces\ContributionInterface;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Reply;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class RequirementsUrlResolver implements QueryInterface
{
    public function __construct(private readonly RouterInterface $router)
    {
    }

    public function __invoke(ContributionInterface $contribution): ?string
    {
        $stepId = $this->getStepGlobalId($contribution->getStep());
        $contributionId = $this->getContributionId($contribution);

        return $this->router->generate(
            'requirements',
            [
                'stepId' => $stepId,
                'contributionId' => $contributionId,
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }

    private function getStepGlobalId(AbstractStep $step): string
    {
        $type = null;
        if ($step instanceof QuestionnaireStep) {
            $type = 'QuestionnaireStep';
        } elseif ($step instanceof SelectionStep) {
            $type = 'SelectionStep';
        } elseif ($step instanceof CollectStep) {
            $type = 'CollectStep';
        }

        if (null === $type) {
            throw new \Exception('Given Step Type not available.');
        }

        return GlobalId::toGlobalId($type, $step->getId());
    }

    private function getContributionId(ContributionInterface $contribution): string
    {
        $type = null;
        if ($contribution instanceof Reply) {
            $type = 'Reply';
        } elseif ($contribution instanceof ProposalSelectionVote || $contribution instanceof ProposalCollectVote) {
            $type = 'AbstractVote';
        }

        return GlobalId::toGlobalId($type, $contribution->getId());
    }
}
