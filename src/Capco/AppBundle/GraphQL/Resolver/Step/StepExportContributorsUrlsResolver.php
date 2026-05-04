<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class StepExportContributorsUrlsResolver implements QueryInterface
{
    public function __construct(private readonly RouterInterface $router)
    {
    }

    /**
     * @return array<int, array{variant: string, url: string}>
     */
    public function __invoke(AbstractStep $step): array
    {
        $parameters = [
            'stepId' => GlobalId::toGlobalId($step->getType(), $step->getId()),
        ];

        $routeName = 'app_export_step_contributors';

        $fullExportUrl = $this->router->generate($routeName, $parameters, UrlGeneratorInterface::ABSOLUTE_URL);
        $simplifiedUrl = $this->router->generate($routeName, [...$parameters, 'simplified' => 'true'], UrlGeneratorInterface::ABSOLUTE_URL);

        return [
            ['variant' => ExportVariantsEnum::FULL->value, 'url' => $fullExportUrl],
            ['variant' => ExportVariantsEnum::SIMPLIFIED->value, 'url' => $simplifiedUrl],
        ];
    }
}
