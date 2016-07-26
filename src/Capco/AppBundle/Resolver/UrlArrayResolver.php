<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\Router;

class UrlArrayResolver
{
    protected $router;
    protected $manager;

    public function __construct(Router $router, Manager $manager)
    {
        $this->router = $router;
        $this->manager = $manager;
    }

    public function generateOpinionOrProposalRoute(array $array, $absolute)
    {
        if (!isset($array['entity_type'])) {
            return 'n/a';
        }

        if ($array['entity_type'] == 'opinion') {
            return $this->router->generate(
                'app_project_show_opinion',
                [
                    'projectSlug' => $array['Step']->getProject()->getSlug(),
                    'stepSlug' => $array['Step']->getSlug(),
                    'opinionTypeSlug' => $array['OpinionType']['slug'],
                    'opinionSlug' => $array['slug'],
                ],
                $absolute
            );
        }

        if ($array['entity_type'] == 'opinionVersion') {
            return $this->router->generate(
                'app_project_show_opinion_version',
                [
                    'projectSlug' => $array['Step']->getProject()->getSlug(),
                    'stepSlug' => $array['Step']->getSlug(),
                    'opinionTypeSlug' => $array['OpinionType']['slug'],
                    'opinionSlug' => $array['parent']['slug'],
                    'versionSlug' => $array['slug'],
                ],
                $absolute
            );
        }

        if ($array['entity_type'] === 'proposal') {
            return $this->router->generate(
                'app_project_show_proposal',
                [
                    'projectSlug' => $array['Step']->getProject()->getSlug(),
                    'stepSlug' => $array['Step']->getSlug(),
                    'proposalSlug' => $array['slug'],
                ],
                $absolute
            );
        }

        return false;
    }

    /**
     * @return Router
     */
    public function getRouter(): Router
    {
        return $this->router;
    }
}
