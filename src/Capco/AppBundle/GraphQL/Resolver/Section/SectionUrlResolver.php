<?php

namespace Capco\AppBundle\GraphQL\Resolver\Section;

use Capco\AppBundle\Entity\OpinionType;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class SectionUrlResolver implements QueryInterface
{
    public function __construct(private readonly RouterInterface $router)
    {
    }

    public function __invoke(OpinionType $type): string
    {
        $step = $type->getStep();
        $project = $step->getProject();

        return $this->router->generate(
            'app_project_show_opinions',
            [
                'projectSlug' => $project->getSlug(),
                'stepSlug' => $step->getSlug(),
                'consultationSlug' => $type->getConsultation()
                    ? $type->getConsultation()->getSlug()
                    : '',
                'opinionTypeSlug' => $type->getSlug(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
