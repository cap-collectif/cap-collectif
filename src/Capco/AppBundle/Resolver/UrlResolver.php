<?php

namespace Capco\AppBundle\Resolver;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Entity\Event;
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
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Routing\RouterInterface;

class UrlResolver
{
    protected $router;
    protected $requestStack;
    protected $manager;
    protected $defaultLocale;

    public function __construct(
        RouterInterface $router,
        Manager $manager,
        RequestStack $requestStack,
        LocaleResolver $localeResolver
    ) {
        $this->router = $router;
        $this->manager = $manager;
        $this->requestStack = $requestStack;
        $this->defaultLocale = $localeResolver->getDefaultLocaleCodeForRequest();
    }

    public function generateOpinionOrProposalRoute($object, bool $absolute): string
    {
        $locale = $this->defaultLocale;
        $request = $this->requestStack->getCurrentRequest();
        if ($request) {
            $locale = $request->getLocale();
        }

        if (!$object) {
            return '';
        }

        $referenceType = $absolute ? RouterInterface::ABSOLUTE_URL : RouterInterface::RELATIVE_PATH;
        if ($object instanceof Opinion && $object->getProject() && $object->getOpinionType()) {
            return $this->router->generate(
                'app_project_show_opinion',
                [
                    'projectSlug' => $object->getProject()->getSlug(),
                    'stepSlug' => $object->getStep()->getSlug(),
                    'opinionTypeSlug' => $object->getOpinionType()->getSlug(),
                    'opinionSlug' => $object->getSlug(),
                    '_locale' => $locale,
                ],
                $referenceType
            );
        }

        if ($object instanceof OpinionVersion) {
            /** @var Opinion $opinion */
            $opinion = $object->getParent();
            if ($opinion->getProject() && $opinion->getOpinionType()) {
                return $this->router->generate(
                    'app_project_show_opinion_version',
                    [
                        'projectSlug' => $opinion->getProject()->getSlug(),
                        'stepSlug' => $opinion->getStep()->getSlug(),
                        'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(),
                        'opinionSlug' => $opinion->getSlug(),
                        'versionSlug' => $object->getSlug(),
                        '_locale' => $locale,
                    ],
                    $referenceType
                );
            }
        }

        if ($object instanceof Proposal && $object->getProject()) {
            return $object->getProject()
                ? $this->router->generate(
                    'app_project_show_proposal',
                    [
                        'projectSlug' => $object->getProject()->getSlug(),
                        'stepSlug' => $object->getStep()->getSlug(),
                        'proposalSlug' => $object->getSlug(),
                        '_locale' => $locale,
                    ],
                    $referenceType
                )
                : $this->router->generate('app_homepage', ['_locale' => $locale]);
        }

        return '';
    }

    public function getStepUrl(?AbstractStep $step = null, bool $absolute = false): string
    {
        $locale = $this->defaultLocale;
        $request = $this->requestStack->getCurrentRequest();
        if ($request) {
            $locale = $request->getLocale();
        }
        if (
            !$step ||
            !$step->getProject() ||
            !$step->getProject()->getSlug() ||
            !$step->getSlug()
        ) {
            return '';
        }

        $referenceType = $absolute ? RouterInterface::ABSOLUTE_URL : RouterInterface::RELATIVE_PATH;

        $args = [
            'projectSlug' => $step->getProject()->getSlug(),
            'stepSlug' => $step->getSlug(),
            '_locale' => $locale,
        ];
        if ($step->isConsultationStep()) {
            // @var ConsultationStep $step
            return $this->router->generate(
                $step->isMultiConsultation()
                    ? 'app_project_show_consultations'
                    : 'app_project_show_consultation',
                $args,
                UrlGeneratorInterface::ABSOLUTE_URL
            );
        }
        if ($step->isPresentationStep()) {
            return $this->router->generate('app_project_show_presentation', $args, $referenceType);
        }
        if ($step->isOtherStep()) {
            return $this->router->generate('app_project_show_step', $args, $referenceType);
        }
        if ($step->isSynthesisStep()) {
            return $this->router->generate('app_project_show_synthesis', $args, $referenceType);
        }
        if ($step->isRankingStep()) {
            return $this->router->generate('app_project_show_ranking', $args, $referenceType);
        }
        if ($step->isCollectStep()) {
            return $this->router->generate('app_project_show_collect', $args, $referenceType);
        }
        if ($step->isSelectionStep()) {
            return $this->router->generate('app_project_show_selection', $args, $referenceType);
        }
        if ($step->isQuestionnaireStep()) {
            return $this->router->generate('app_project_show_questionnaire', $args, $referenceType);
        }

        return '';
    }

    public function getObjectUrl($object, bool $absolute = false): string
    {
        $locale = $this->defaultLocale;
        $request = $this->requestStack->getCurrentRequest();
        if ($request) {
            $locale = $request->getLocale();
        }

        $referenceType = $absolute ? RouterInterface::ABSOLUTE_URL : RouterInterface::RELATIVE_PATH;
        if ($object instanceof Post && $object->getSlug()) {
            return $this->router->generate(
                'app_blog_show',
                ['slug' => $object->getSlug(), '_locale' => $locale],
                $referenceType
            );
        }

        if ($object instanceof Argument && $object->getParent() && $object->getId()) {
            return $this->generateOpinionOrProposalRoute($object->getParent(), $absolute) .
                '#arg-' .
                $object->getId();
        }

        if ($object instanceof Source && $object->getParent() && $object->getId()) {
            return $this->generateOpinionOrProposalRoute($object->getParent(), $absolute) .
                '#source-' .
                $object->getId();
        }

        if ($object instanceof AbstractStep) {
            return $this->getStepUrl($object, $absolute);
        }

        if ($object instanceof Event && $object->getSlug()) {
            return $this->router->generate(
                'app_event_show',
                ['slug' => $object->getSlug(), '_locale' => $locale],
                $referenceType
            );
        }

        if ($object instanceof Comment && $object->getRelatedObject()) {
            return $this->getObjectUrl($object->getRelatedObject(), $absolute) .
                '#comment_' .
                $object->getId();
        }

        if ($object instanceof Reporting && $object->getRelated()) {
            return $this->getObjectUrl($object->getRelated(), $absolute);
        }

        if ($object instanceof Theme && $object->getSlug()) {
            return $this->router->generate(
                'app_theme_show',
                ['slug' => $object->getSlug(), '_locale' => $locale],
                $referenceType
            );
        }

        if ($object instanceof User && $object->getSlug()) {
            return $this->manager->isActive('profiles')
                ? $this->router->generate(
                    'capco_user_profile_show_all',
                    ['slug' => $object->getSlug(), '_locale' => $locale],
                    $referenceType
                )
                : '';
        }

        if (false !== ($url = $this->generateOpinionOrProposalRoute($object, $absolute))) {
            return $url;
        }

        return '';
    }

    public function getAdminObjectUrl($object, bool $absolute = false): string
    {
        if (!$object) {
            return '';
        }

        $referenceType = $absolute ? RouterInterface::ABSOLUTE_URL : RouterInterface::RELATIVE_PATH;
        if ($object instanceof Source) {
            return $this->router->generate(
                'admin_capco_app_source_show',
                ['id' => $object->getId()],
                $referenceType
            );
        }

        if ($object instanceof Argument) {
            return $this->router->generate(
                'admin_capco_app_argument_show',
                ['id' => $object->getId()],
                $referenceType
            );
        }

        if ($object instanceof Comment) {
            return $this->getAdminObjectUrl($object->getRelatedObject(), $absolute);
        }

        if ($object instanceof Opinion) {
            return $this->router->generate(
                'admin_capco_app_opinion_show',
                ['id' => $object->getId()],
                $referenceType
            );
        }

        if ($object instanceof OpinionVersion) {
            return $this->router->generate(
                'admin_capco_app_opinionversion_show',
                ['id' => $object->getId()],
                $referenceType
            );
        }

        if ($object instanceof Proposal) {
            return $this->router->generate(
                'admin_capco_app_proposal_edit',
                ['id' => $object->getId()],
                $referenceType
            );
        }

        return '';
    }

    public function getReportedUrl(Reporting $reporting, bool $absolute = false): string
    {
        $referenceType = $absolute ? RouterInterface::ABSOLUTE_URL : RouterInterface::RELATIVE_PATH;

        return $this->router->generate(
            'admin_capco_app_reporting_show',
            ['id' => $reporting->getId()],
            $referenceType
        );
    }
}
