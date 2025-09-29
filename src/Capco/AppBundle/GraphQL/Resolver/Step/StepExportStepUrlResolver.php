<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class StepExportStepUrlResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router
    ) {
    }

    public function __invoke(AbstractStep $step): string
    {
        if ($step->isDebateStep() && $step->getDebate()) {
            return $this->router->generate(
                'app_debate_download',
                [
                    'debateId' => GlobalId::toGlobalId(
                        $step->getType(),
                        $step->getDebate()->getId()
                    ),
                    'type' => 'arguments',
                ],
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }

        return $this->router->generate(
            'app_project_download',
            [
                'projectSlug' => $step->getProject()->getSlug(),
                'stepSlug' => $step->getSlug(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
