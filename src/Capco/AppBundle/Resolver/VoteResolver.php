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

class VoteResolver
{
    protected $router;
    protected $commentResolver;

    public function __construct(Router $router, CommentResolver $commentResolver)
    {
        $this->router = $router;
        $this->commentResolver = $commentResolver;
    }

    public function getRelatedObject(Vote $vote)
    {
        return $vote->getRelatedEntity();
    }

    public function getObjectUrl($object, $absolute = false)
    {
        if ($object instanceof Idea) {
            return $this->router->generate('app_idea_show', array('slug' => $object->getSlug()), $absolute);
        }

        if ($object instanceof Argument || $object instanceof Source) {
            $proposition = $object->getParent();
            if ($proposition instanceof Opinion) {
                return $this->router->generate('app_consultation_show_opinion', [
                    'consultationSlug' => $proposition->getStep()->getConsultation()->getSlug(),
                    'stepSlug' => $proposition->getStep()->getSlug(),
                    'opinionTypeSlug' => $proposition->getOpinionType()->getSlug(),
                    'opinionSlug' => $proposition->getSlug(),
                ], $absolute);
            }
            if ($proposition instanceof OpinionVersion) {
                $opinion = $proposition->getParent();
                return $this->router->generate('app_consultation_show_opinion_version', [
                    'consultationSlug' => $opinion->getStep()->getConsultation()->getSlug(),
                    'stepSlug' => $opinion->getStep()->getSlug(),
                    'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                    'versionSlug' => $proposition->getSlug(),
                ], $absolute);
            }
        }

        if ($object instanceof AbstractComment) {
            return $this->commentResolver->getUrlOfObject($object);
        }

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

        return $this->router->generate('app_homepage', array(), $absolute);
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
            return $this->commentResolver->getAdminUrlOfObject($object);
        }

        if ($object instanceof Opinion) {
            return $this->router->generate('admin_capco_app_opinion_show', array('id' => $object->getId()), $absolute);
        }

        return '';
    }

    public function getRelatedObjectUrl(Vote $vote, $absolute = false)
    {
        $object = $this->getRelatedObject($vote);

        return $this->getObjectUrl($object, $absolute);
    }

    public function getRelatedObjectAdminUrl(Vote $vote, $absolute = false)
    {
        $object = $this->getRelatedObject($vote);

        return $this->getAdminObjectUrl($object, $absolute);
    }
}
