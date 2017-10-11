<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Toggle\Manager;
use Capco\UserBundle\Entity\User;
use Sonata\MediaBundle\Twig\Extension\MediaExtension;
use Symfony\Component\Routing\Exception\RouteNotFoundException;
use Symfony\Component\Routing\Router;

class UrlResolver
{
    protected $router;
    protected $manager;
    protected $mediaExtension;

    public function __construct(Router $router, Manager $manager, MediaExtension $mediaExtension)
    {
        $this->router = $router;
        $this->manager = $manager;
        $this->mediaExtension = $mediaExtension;
    }

    public function getMediaUrl($media)
    {
        try {
            return $this->mediaExtension->path(
            $media,
            $this->getImageFormat()
          );
        } catch (RouteNotFoundException $e) {
            // Avoid some SonataMedia problems
            return '';
        }
    }

    public function generateOpinionOrProposalRoute($object, $absolute)
    {
        if ($object instanceof Opinion) {
            return $this->router->generate(
                'app_project_show_opinion',
                [
                    'projectSlug' => $object->getStep()->getProject()->getSlug(),
                    'stepSlug' => $object->getStep()->getSlug(),
                    'opinionTypeSlug' => $object->getOpinionType()->getSlug(),
                    'opinionSlug' => $object->getSlug(),
                ],
                $absolute
            );
        }

        if ($object instanceof OpinionVersion) {
            $opinion = $object->getParent();

            return $this->router->generate(
                'app_project_show_opinion_version',
                [
                    'projectSlug' => $opinion->getStep()->getProject()->getSlug(),
                    'stepSlug' => $opinion->getStep()->getSlug(),
                    'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                    'versionSlug' => $object->getSlug(),
                ],
                $absolute
            );
        }

        if ($object instanceof Proposal) {
            return $this->router->generate(
                'app_project_show_proposal',
                [
                    'projectSlug' => $object->getStep()->getProject()->getSlug(),
                    'stepSlug' => $object->getStep()->getSlug(),
                    'proposalSlug' => $object->getSlug(),
                ],
                $absolute
            );
        }

        return false;
    }

    public function getStepUrl($step, $absolute = false)
    {
        if (!$step->getProject() || !$step->getProject()->getSlug() || !$step->getSlug()) {
            return;
        }
        if ($step->isConsultationStep()) {
            return $this->router->generate(
                'app_project_show_consultation',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $absolute
            );
        }
        if ($step->isPresentationStep()) {
            return $this->router->generate(
                'app_project_show_presentation',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $absolute
            );
        }
        if ($step->isOtherStep()) {
            return $this->router->generate(
                'app_project_show_step',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $absolute
            );
        }
        if ($step->isSynthesisStep()) {
            return $this->router->generate(
                'app_project_show_synthesis',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $absolute
            );
        }
        if ($step->isRankingStep()) {
            return $this->router->generate(
                'app_project_show_ranking',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $absolute
            );
        }
        if ($step->isCollectStep()) {
            return $this->router->generate(
                'app_project_show_collect',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $absolute
            );
        }
        if ($step->isSelectionStep()) {
            return $this->router->generate(
                'app_project_show_selection',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $absolute
            );
        }
        if ($step->isQuestionnaireStep()) {
            return $this->router->generate(
                'app_project_show_questionnaire',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $absolute
            );
        }

        return '';
    }

    public function getObjectUrl($object, $absolute = false)
    {
        if ($object instanceof Idea && $object->getSlug()) {
            return $this->router->generate('app_idea_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof Post && $object->getSlug()) {
            return $this->router->generate('app_blog_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof Argument && $object->getParent() && $object->getId()) {
            return $this->generateOpinionOrProposalRoute($object->getParent(), $absolute) . '#arg-' . $object->getId();
        }

        if ($object instanceof Source && $object->getParent() && $object->getId()) {
            return $this->generateOpinionOrProposalRoute($object->getParent(), $absolute) . '#source-' . $object->getId();
        }

        if ($object instanceof AbstractStep) {
            return $this->getStepUrl($object, $absolute);
        }

        if ($object instanceof Event && $object->getSlug()) {
            return $this->router->generate('app_event_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof Comment && $object->getRelatedObject()) {
            return $this->getObjectUrl($object->getRelatedObject());
        }

        if ($object instanceof Theme && $object->getSlug()) {
            return $this->router->generate('app_theme_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof User && $object->getSlug()) {
            return $this->manager->isActive('profiles')
                ? $this->router->generate('capco_user_profile_show_all', ['slug' => $object->getSlug()], $absolute)
                : null;
        }

        if (false !== $url = $this->generateOpinionOrProposalRoute($object, $absolute)) {
            return $url;
        }

        return '';
    }

    public function getTrashedObjectUrl($object, $absolute = false)
    {
        if ($object instanceof Idea && $object->getSlug()) {
            return $this->router->generate('app_idea_show', ['slug' => $object->getSlug()], $absolute);
        }

        if (($object instanceof Argument || $object instanceof Source) && $object->getLinkedOpinion()) {
            return $this->router
                ->generate(
                    'app_project_show_trashed',
                    [
                        'projectSlug' => $object->getLinkedOpinion()->getStep()->getProject()->getSlug(),
                    ],
                    $absolute
                );
        }

        if (false !== $url = $this->generateOpinionOrProposalRoute($object, $absolute)) {
            return $url;
        }
    }

    public function getAdminObjectUrl($object, $absolute = false)
    {
        if ($object instanceof Idea) {
            return $this->router->generate('admin_capco_app_idea_show', ['id' => $object->getId()], $absolute);
        }

        if ($object instanceof Source) {
            return $this->router->generate('admin_capco_app_source_show', ['id' => $object->getId()], $absolute);
        }

        if ($object instanceof Argument) {
            return $this->router->generate('admin_capco_app_argument_show', ['id' => $object->getId()], $absolute);
        }

        if ($object instanceof Comment) {
            return $this->getAdminObjectUrl($object->getRelatedObject(), $absolute);
        }

        if ($object instanceof Opinion) {
            return $this->router->generate('admin_capco_app_opinion_show', ['id' => $object->getId()], $absolute);
        }

        if ($object instanceof OpinionVersion) {
            return $this->router->generate(
                'admin_capco_app_opinionversion_show',
                ['id' => $object->getId()],
                $absolute
            );
        }

        if ($object instanceof Proposal) {
            return $this->router->generate('admin_capco_app_proposal_show', ['id' => $object->getId()], $absolute);
        }

        return '';
    }

    public function getReportedUrl(Reporting $reporting, bool $absolute = false): string
    {
        return $this->router->generate('admin_capco_app_reporting_show', ['id' => $reporting->getId()], $absolute);
    }

    private function getImageFormat()
    {
        // $parent instanceof Post:
        //   return 'post';
        return 'avatar';
    }
}
