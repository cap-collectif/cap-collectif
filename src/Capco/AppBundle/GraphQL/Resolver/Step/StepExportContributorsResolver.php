<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class StepExportContributorsResolver implements QueryInterface
{
    private RouterInterface $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(AbstractStep $step): string
    {
        return $this->router->generate(
            'app_export_step_contributors',
            [
                'stepId' => GlobalId::toGlobalId($step->getType(), $step->getId()),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
