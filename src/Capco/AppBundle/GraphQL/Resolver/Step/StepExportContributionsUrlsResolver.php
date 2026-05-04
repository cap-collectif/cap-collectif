<?php

namespace Capco\AppBundle\GraphQL\Resolver\Step;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Enum\ExportVariantsEnum;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class StepExportContributionsUrlsResolver implements QueryInterface
{
    public function __construct(private readonly RouterInterface $router)
    {
    }

    /**
     * @return array<int, array{variant: string, url: string}>
     */
    public function __invoke(AbstractStep $step): array
    {
//        if ($step->isDebateStep() && $step->getDebate()) {
//            return $this->router->generate(
//                'app_debate_download',
//                [
//                    'debateId' => GlobalId::toGlobalId(
//                        $step->getType(),
//                        $step->getDebate()->getId()
//                    ),
//                    'type' => 'arguments',
//                ],
//                UrlGeneratorInterface::ABSOLUTE_URL
//            );
//        }

        $routeName = 'app_project_download';
        $parameters = [
            'projectSlug' => $step->getProject()->getSlug(),
            'stepSlug' => $step->getSlug(),
        ];

        $fullExportUrl = $this->router->generate($routeName, $parameters, UrlGeneratorInterface::ABSOLUTE_URL);
        $simplifiedUrl = $this->router->generate($routeName, [...$parameters, 'simplified' => 'true'], UrlGeneratorInterface::ABSOLUTE_URL);

        return [
            ['variant' => ExportVariantsEnum::FULL->value, 'url' => $fullExportUrl],
            ['variant' => ExportVariantsEnum::SIMPLIFIED->value, 'url' => $simplifiedUrl],
        ];
    }
}
