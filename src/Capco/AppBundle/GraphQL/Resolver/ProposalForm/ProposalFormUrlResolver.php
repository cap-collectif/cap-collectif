<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\RouterInterface;

class ProposalFormUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(ProposalForm $proposalForm): string
    {
        $step = $proposalForm->getStep();
        $project = $proposalForm->getProject();

        if (!$project || !$step) {
            return '';
        }

        return $this->router->generate(
            'app_project_show_collect',
            [
                'projectSlug' => $project->getSlug(),
                'stepSlug' => $step->getSlug(),
            ],
            true
        );
    }
}
