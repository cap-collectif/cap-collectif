<?php

namespace Capco\AppBundle\GraphQL\Resolver\OpinionVersion;

use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Overblog\GraphQLBundle\Definition\Resolver\ResolverInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class OpinionVersionUrlResolver implements ResolverInterface
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function __invoke(OpinionVersion $version): string
    {
        /** @var OpinionVersion $opinion */
        $opinion = $version->getParent();
        /** @var OpinionType $opinionType */
        $opinionType = $opinion->getOpinionType();
        /** @var AbstractStep $step */
        $step = $opinion->getStep();
        /** @var Project $project */
        $project = $step->getProject();

        return $this->router->generate(
            'app_project_show_opinion_version',
            [
                'projectSlug' => $project->getSlug(),
                'stepSlug' => $step->getSlug(),
                'opinionTypeSlug' => $opinionType->getSlug(),
                'opinionSlug' => $opinion->getSlug(),
                'versionSlug' => $version->getSlug(),
            ],
            UrlGeneratorInterface::ABSOLUTE_URL
        );
    }
}
