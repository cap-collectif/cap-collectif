<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class ProjectLabelMetaExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('project_type_meta_label', [
                ProjectLabelMetaRuntime::class,
                'getProjectTypeMetaLabel',
            ]),
        ];
    }
}
