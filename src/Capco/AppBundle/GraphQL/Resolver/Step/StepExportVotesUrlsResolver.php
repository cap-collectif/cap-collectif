<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class StepExportVotesUrlsResolver implements QueryInterface
{
    public function __construct(private readonly RouterInterface $router)
    {
    }

    /**
     * @return array<int, array{variant: string, url: string}>
     */
    public function __invoke(AbstractStep $step): array
    {
        $routeName = 'app_project_download';
        $parameters = [
            'projectSlug' => $step->getProject()->getSlug(),
            'stepSlug' => $step->getSlug(),
            'votes' => 'true',
            'simplified' => 'true',
        ];

        $simplifiedUrl = $this->router->generate($routeName, $parameters, UrlGeneratorInterface::ABSOLUTE_URL);

        return [
            ['variant' => ExportVariantsEnum::SIMPLIFIED->value, 'url' => $simplifiedUrl],
        ];
    }
}
