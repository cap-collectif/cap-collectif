<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\AbstractStep;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\AbstractComment;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Theme;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\Router;

class UrlResolver
{
    protected $router;

    public function __construct(Router $router)
    {
        $this->router = $router;
    }

    public function generateOpinionRoute($object, $absolute)
    {
        if ($object instanceof Opinion) {
            return $this->router->generate('app_consultation_show_opinion', [
                'consultationSlug' => $object->getStep()->getConsultation()->getSlug(),
                'stepSlug' => $object->getStep()->getSlug(),
                'opinionTypeSlug' => $object->getOpinionType()->getSlug(),
                'opinionSlug' => $object->getSlug(),
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

    public function getStepUrl($step, $absolute = false)
    {
        if ($step->isConsultationStep()) {
            return $this->router->generate('app_consultation_show', array('consultationSlug' => $step->getConsultation()->getSlug(), 'stepSlug' => $step->getSlug()), $absolute);
        }
        if ($step->isPresentationStep()) {
            return $this->router->generate('app_consultation_show_presentation', array('consultationSlug' => $step->getConsultation()->getSlug(), 'stepSlug' => $step->getSlug()), $absolute);
        }
        if ($step->isOtherStep()) {
            return $this->router->generate('app_consultation_show_step', array('consultationSlug' => $step->getConsultation()->getSlug(), 'stepSlug' => $step->getSlug()), $absolute);
        }
        if ($step->isSynthesisStep()) {
            return $this->router->generate('app_consultation_show_synthesis', array('consultationSlug' => $step->getConsultation()->getSlug(), 'stepSlug' => $step->getSlug()), $absolute);
        }
        if ($step->isRankingStep()) {
            return $this->router->generate('app_consultation_show_ranking', array('consultationSlug' => $step->getConsultation()->getSlug(), 'stepSlug' => $step->getSlug()), $absolute);
        }

        return '';
    }

    public function getObjectUrl($object, $absolute = false)
    {
        if ($object instanceof Idea) {
            return $this->router->generate('app_idea_show', array('slug' => $object->getSlug()), $absolute);
        }

        if ($object instanceof Post) {
            return $this->router->generate('app_blog_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof Argument || $object instanceof Source) {
            return $this->generateOpinionRoute($object->getParent(), $absolute);
        }

        if ($object instanceof AbstractStep) {
            return $this->getStepUrl($object, $absolute);
        }

        if ($object instanceof Event) {
            return $this->router->generate('app_event_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof AbstractComment) {
            return $this->getObjectUrl($object->getRelatedObject());
        }

        if ($object instanceof Theme) {
            return $this->router->generate('app_theme_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof User) {
            return $this->router->generate('capco_user_profile_show_all', ['slug' => $object->getSlug()], $absolute);
        }

        if (false !== $url = $this->generateOpinionRoute($object, $absolute)) {
            return $url;
        }

        return '';
    }

    public function getTrashedObjectUrl($object, $absolute = false)
    {
        if ($object instanceof Idea) {
            return $this->router->generate('app_idea_show', array('slug' => $object->getSlug()), $absolute);
        }

        if ($object instanceof Argument || $object instanceof Source) {
            return $this->router
                ->generate('app_consultation_show_trashed', [
                    'consultationSlug' => $object->getLinkedOpinion()->getStep()->getConsultation()->getSlug(),
                ], $absolute)
            ;
        }

        if (false !== $url = $this->generateOpinionRoute($object, $absolute)) {
            return $url;
        }

        return;
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
