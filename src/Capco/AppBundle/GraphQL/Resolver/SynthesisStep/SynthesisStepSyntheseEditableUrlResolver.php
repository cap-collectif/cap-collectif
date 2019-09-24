<?php

namespace Capco\AppBundle\GraphQL\Resolver\SynthesisStep;

use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class SynthesisStepSyntheseEditableUrlResolver implements ResolverInterface
{
    protected $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(SynthesisStep $step): ?string
    {
        if (!$step->getProject()) {
            return null;
        }

        return $this->router->generate(
            'app_project_edit_synthesis',
            [
                'projectSlug' => $step->getProject()->getSlug(),
                'stepSlug' => $step->getSlug()
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
