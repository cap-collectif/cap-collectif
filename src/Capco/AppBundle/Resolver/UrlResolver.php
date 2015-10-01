<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\AbstractComment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\AbstractVote as Vote;
use Capco\AppBundle\Manager\CommentResolver;
use Symfony\Component\Routing\Router;

class UrlResolver
{
    protected $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function generatePropositionRoute($object, $absolute)
    {
        if ($object instanceof Opinion) {
            return $this->router->generate('app_consultation_show_opinion', [
                'consultationSlug' => $object->getStep()->getConsultation()->getSlug(),
                'stepSlug' => $object->getStep()->getSlug(),
                'opinionTypeSlug' => $object->getOpinionType()->getSlug(),
                'opinionSlug' => $object->getSlug()
            ], $absolute);
        }

        if ($object instanceof OpinionVersion) {
            $opinion = $object->getParent();
            return $this->router->generate('app_consultation_show_opinion_version', [
                'consultationSlug' => $opinion->getStep()->getConsultation()->getSlug(),
                'stepSlug' => $opinion->getStep()->getSlug(),
                'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(),
                'opinionSlug' => $opinion->getSlug(),
                'versionSlug' => $object->getSlug(),
            ], $absolute);
        }

        return false;
    }

    public function getObjectUrl($object, $absolute = false)
    {
        if ($object instanceof Idea) {
            return $this->router->generate('app_idea_show', array('slug' => $object->getSlug()), $absolute);
        }

        if ($object instanceof Argument || $object instanceof Source) {
            return $this->generatePropositionRoute($object->getParent(), $absolute);
        }

        if ($object instanceof AbstractComment) {
            return $this->getObjectUrl($object->getRelatedObject());
        }

        if (false !== $url = $this->generatePropositionRoute($object, $absolute)) {
            return $url;
        }

        return $this->router->generate('app_homepage', [], $absolute);
    }

    public function getAdminObjectUrl($object, $absolute = false)
    {
        if ($object instanceof Idea) {
            return $this->router->generate('admin_capco_app_idea_show', array('id' => $object->getId()), $absolute);
        }

        if ($object instanceof Source) {
            return $this->router->generate('admin_capco_app_source_show', array('id' => $object->getId()), $absolute);
        }

        if ($object instanceof Argument) {
            return $this->router->generate('admin_capco_app_argument_show', array('id' => $object->getId()), $absolute);
        }

        if ($object instanceof AbstractComment) {
            return $this->getAdminObjectUrl($object->getRelatedEntity(), $absolute);
        }

        if ($object instanceof Opinion) {
            return $this->router->generate('admin_capco_app_opinion_show', array('id' => $object->getId()), $absolute);
        }

        if ($object instanceof OpinionVersion) {
            return $this->router->generate('admin_capco_app_opinionversion_show', array('id' => $object->getId()), $absolute);
        }

        return '';
    }
}
