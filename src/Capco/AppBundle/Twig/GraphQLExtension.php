<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class GraphQLExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction('graphql_offset_to_cursor', [
                GraphQLRuntime::class,
                'getOffsetToCursor',
            ]),
            new TwigFunction('graphql_list_collect_steps', [
                GraphQLRuntime::class,
                'getCollectSteps',
            ]),
            new TwigFunction('graphql_list_questionnaires', [
                GraphQLRuntime::class,
                'getQuestionnaires',
            ]),
            new TwigFunction('graphql_list_consultations', [
                GraphQLRuntime::class,
                'getConsultations',
            ]),
            new TwigFunction('graphql_list_projects', [GraphQLRuntime::class, 'getProjects']),
        ];
    }
}
