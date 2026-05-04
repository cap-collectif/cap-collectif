<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class StepExportGroupedUrlsResolver implements QueryInterface
{
    public function __construct(
        private readonly RouterInterface $router
    ) {
    }

    /**
     * @return array<int, array{variant: string, url: string}>
     */
    public function __invoke(AbstractStep $step): array
    {
        $exportUrl = $this->router->generate(
            'app_project_download',
            [
                'projectSlug' => $step->getProject()->getSlug(),
                'stepSlug' => $step->getSlug(),
                'grouped' => 'true',
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        return [
            ['variant' => ExportVariantsEnum::SIMPLIFIED->value, 'url' => $exportUrl],
        ];
    }
}
