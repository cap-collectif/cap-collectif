<?php

namespace Capco\AppBundle\UrlResolver\Factories;

use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\UrlResolver\RoutesRegistry;

class WithParentRouteFactory extends AbstractRouteFactory
{
    /**
     * Create a route object.
     *
     * @return void
     */
    public function createName()
    {
        $entityName = (new \ReflectionClass(get_class($this->entity)))->getName();

        $this->route->setName(RoutesRegistry::get($entityName));
    }

    /**
     * Create all parameters for a route.
     * TODO to refactor.
     *
     * @return void
     */
    public function createParameters()
    {
        if ($this->entity instanceof Proposal) {
            $parameters = [
                'projectSlug' => $this->entity->getStep()->getProject()->getSlug(),
                'stepSlug' => $this->entity->getStep()->getSlug(),
                'proposalSlug' => $this->entity->getSlug(),
            ];
        } elseif ($this->entity instanceof OpinionVersion) {
            $opinion = $this->entity->getParent();

            $parameters = [
                'projectSlug' => $opinion->getStep()->getProject()->getSlug(),
                'stepSlug' => $opinion->getStep()->getSlug(),
                'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(),
                'opinionSlug' => $opinion->getSlug(),
                'versionSlug' => $this->entity->getSlug(),
            ];
        } else {
            $parameters = [
                'projectSlug' => $this->entity->getStep()->getProject()->getSlug(),
                'stepSlug' => $this->entity->getStep()->getSlug(),
                'opinionTypeSlug' => $this->entity->getOpinionType()->getSlug(),
                'opinionSlug' => $this->entity->getSlug(),
            ];
        }

        $this->route->setParameters($parameters);
    }
}