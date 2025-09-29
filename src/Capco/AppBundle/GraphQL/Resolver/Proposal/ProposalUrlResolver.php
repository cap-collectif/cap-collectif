<?php

namespace Capco\AppBundle\GraphQL\Resolver\Proposal;

use Capco\AppBundle\Entity\Proposal;
use Overblog\GraphQLBundle\Definition\Resolver\QueryInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class ProposalUrlResolver implements QueryInterface
{
    public function __construct(
        protected RouterInterface $router
    ) {
    }

    public function __invoke(Proposal $proposal, ?RequestStack $requestStack = null): string
    {
        $step = $proposal->getStep();
        if (!$step) {
            return '';
        }
        $project = $step->getProject();
        if (!$project) {
            return '';
        }

        $request = isset($requestStack) ? $requestStack->getCurrentRequest() : null;

        if ($request) {
            $locale = $request->getLocale();
        }

        $params = [
            'proposalSlug' => $proposal->getSlug(),
            'projectSlug' => $project->getSlug(),
            'stepSlug' => $step->getSlug(),
        ];

        if (isset($locale)) {
            $params['_locale'] = $locale;
        }

        return $this->router->generate(
            'app_project_show_proposal',
            $params,
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
