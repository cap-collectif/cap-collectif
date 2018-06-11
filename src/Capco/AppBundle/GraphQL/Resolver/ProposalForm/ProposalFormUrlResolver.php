<?php

namespace Capco\AppBundle\GraphQL\Resolver\ProposalForm;

use Capco\AppBundle\Entity\ProposalForm;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;

class ProposalFormUrlResolver implements ContainerAwareInterface
{
    use ContainerAwareTrait;

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

        return $this->container->get('router')->generate('app_project_show_collect',
            [
                'projectSlug' => $project->getSlug(),
                'stepSlug' => $step->getSlug(),
            ], true);
    }
}
