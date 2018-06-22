<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Router;

class ProposalFormUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function __invoke(ProposalForm $proposalForm): string
    {
        $step = $proposalForm->getStep();

        if (!$step) {
            return '';
        }

        $project = $step->getProject();
        if (!$project) {
            return '';
        }

        return $this->router->generate('app_project_show_collect',
            [
                'projectSlug' => $project->getSlug(),
                'stepSlug' => $step->getSlug(),
            ], true);
    }
}
