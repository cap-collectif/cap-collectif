<?php

namespace Capco\AppBundle\Resolver;

use Symfony\Component\Routing\Router;

class UrlArrayResolver
{
    protected $router;
    protected $referenceType;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function getRoute(array $array, int $referenceType = 0): string
    {
        if (!isset($array['entity_type'])) {
            return 'n/a';
        }

        $this->referenceType = $referenceType;

        if ('opinion' === $array['entity_type']) {
            return $this->getOpinionRoute($array);
        }

        if ('opinionVersion' === $array['entity_type']) {
            return $this->getOpinionVersionRoute($array);
        }

        if ('proposal' === $array['entity_type']) {
            return $this->getProposalRoute($array);
        }
    }

    protected function getProposalRoute(array $proposal): string
    {
        return $this->router->generate(
            'app_project_show_proposal',
            [
                'projectSlug' => $proposal['Step']->getProject()->getSlug(),
                'stepSlug' => $proposal['Step']->getSlug(),
                'proposalSlug' => $proposal['slug'],
            ],
            $this->referenceType
        );
    }

    protected function getOpinionRoute(array $opinion): string
    {
        return $this->router->generate(
            'app_project_show_opinion',
            [
                'projectSlug' => $opinion['Step']->getProject()->getSlug(),
                'stepSlug' => $opinion['Step']->getSlug(),
                'opinionTypeSlug' => $opinion['OpinionType']['slug'],
                'opinionSlug' => $opinion['slug'],
            ],
            $this->referenceType
        );
    }

    protected function getOpinionVersionRoute(array $version): string
    {
        return $this->router->generate(
            'app_project_show_opinion_version',
            [
                'projectSlug' => $version['Step']->getProject()->getSlug(),
                'stepSlug' => $version['Step']->getSlug(),
                'opinionTypeSlug' => $version['OpinionType']['slug'],
                'opinionSlug' => $version['parent']['slug'],
                'versionSlug' => $version['slug'],
            ],
            $this->referenceType
        );
    }
}
