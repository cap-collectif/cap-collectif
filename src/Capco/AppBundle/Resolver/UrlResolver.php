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
use Capco\AppBundle\Twig\MediaExtension;
use Capco\MediaBundle\Entity\Media;
use Capco\UserBundle\Entity\User;
use Overblog\GraphQLBundle\Definition\Argument as Arg;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Routing\Router;
use Symfony\Component\Routing\RouterInterface;

class UrlResolver
{
    protected $router;
    protected $manager;
    protected $mediaExtension;
    protected $scheme;
    protected $host;
    private $container;

    public function __construct(
        ContainerInterface $container,
        Router $router,
        Manager $manager,
        MediaExtension $mediaExtension,
        ?string $scheme = '',
        ?string $host = ''
    ) {
        $this->router = $router;
        $this->manager = $manager;
        $this->mediaExtension = $mediaExtension;
        $this->scheme = $scheme;
        $this->host = $host;
        $this->container = $container;
    }

    public function getMediaUrl(Media $media, ?Arg $args = null): string
    {
        if (!$media) {
            return '';
        }

        $format = $args ? $args['format'] ?? 'reference' : 'reference';
        $provider = $this->container->get($media->getProviderName());
        $path = '';
        if ('reference' === $format) {
            $path = '/media';
        }

        return $this->scheme .
            '://' .
            $this->host .
            $path .
            $provider->generatePublicUrl($media, $format);
    }

    public function generateOpinionOrProposalRoute($object, $absolute)
    {
        $referenceType = $absolute ? RouterInterface::ABSOLUTE_URL : RouterInterface::RELATIVE_PATH;
        if ($object instanceof Opinion) {
            return $this->router->generate(
                'app_project_show_opinion',
                [
                    'projectSlug' => $object
                        ->getStep()
                        ->getProject()
                        ->getSlug(),
                    'stepSlug' => $object->getStep()->getSlug(),
                    'opinionTypeSlug' => $object->getOpinionType()->getSlug(),
                    'opinionSlug' => $object->getSlug(),
                ],
                $referenceType
            );
        }

        if ($object instanceof OpinionVersion) {
            $opinion = $object->getParent();

            return $this->router->generate(
                'app_project_show_opinion_version',
                [
                    'projectSlug' => $opinion
                        ->getStep()
                        ->getProject()
                        ->getSlug(),
                    'stepSlug' => $opinion->getStep()->getSlug(),
                    'opinionTypeSlug' => $opinion->getOpinionType()->getSlug(),
                    'opinionSlug' => $opinion->getSlug(),
                    'versionSlug' => $object->getSlug(),
                ],
                $referenceType
            );
        }

        if ($object instanceof Proposal) {
            return $object->getStep() && $object->getStep()->getProject()
                ? $this->router->generate(
                    'app_project_show_proposal',
                    [
                        'projectSlug' => $object
                            ->getStep()
                            ->getProject()
                            ->getSlug(),
                        'stepSlug' => $object->getStep()->getSlug(),
                        'proposalSlug' => $object->getSlug(),
                    ],
                    $referenceType
                )
                : $this->router->generate('app_homepage');
        }

        return false;
    }

    public function getStepUrl($step, $absolute = false)
    {
        if (!$step->getProject() || !$step->getProject()->getSlug() || !$step->getSlug()) {
            return;
        }

        $referenceType = $absolute ? RouterInterface::ABSOLUTE_URL : RouterInterface::RELATIVE_PATH;
        if ($step->isConsultationStep()) {
            return $this->router->generate(
                'app_project_show_consultation',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $referenceType
            );
        }
        if ($step->isPresentationStep()) {
            return $this->router->generate(
                'app_project_show_presentation',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $referenceType
            );
        }
        if ($step->isOtherStep()) {
            return $this->router->generate(
                'app_project_show_step',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $referenceType
            );
        }
        if ($step->isSynthesisStep()) {
            return $this->router->generate(
                'app_project_show_synthesis',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $referenceType
            );
        }
        if ($step->isRankingStep()) {
            return $this->router->generate(
                'app_project_show_ranking',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $referenceType
            );
        }
        if ($step->isCollectStep()) {
            return $this->router->generate(
                'app_project_show_collect',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $referenceType
            );
        }
        if ($step->isSelectionStep()) {
            return $this->router->generate(
                'app_project_show_selection',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $referenceType
            );
        }
        if ($step->isQuestionnaireStep()) {
            return $this->router->generate(
                'app_project_show_questionnaire',
                ['projectSlug' => $step->getProject()->getSlug(), 'stepSlug' => $step->getSlug()],
                $referenceType
            );
        }

        return '';
    }

    public function getObjectUrl($object, $absolute = false)
    {
        $referenceType = $absolute ? RouterInterface::ABSOLUTE_URL : RouterInterface::RELATIVE_PATH;
        if ($object instanceof Post && $object->getSlug()) {
            return $this->router->generate(
                'app_blog_show',
                ['slug' => $object->getSlug()],
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
                ['slug' => $object->getSlug()],
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
                ['slug' => $object->getSlug()],
                $referenceType
            );
        }

        if ($object instanceof User && $object->getSlug()) {
            return $this->manager->isActive('profiles')
                ? $this->router->generate(
                    'capco_user_profile_show_all',
                    ['slug' => $object->getSlug()],
                    $referenceType
                )
                : null;
        }

        if (false !== ($url = $this->generateOpinionOrProposalRoute($object, $absolute))) {
            return $url;
        }

        return '';
    }

    public function getTrashedObjectUrl($object, $absolute = false)
    {
        if (
            ($object instanceof Argument || $object instanceof Source) &&
            $object->getLinkedOpinion()
        ) {
            $referenceType = $absolute
                ? RouterInterface::ABSOLUTE_URL
                : RouterInterface::RELATIVE_PATH;

            return $this->router->generate(
                'app_project_show_trashed',
                [
                    'projectSlug' => $object
                        ->getLinkedOpinion()
                        ->getStep()
                        ->getProject()
                        ->getSlug(),
                ],
                $referenceType
            );
        }

        if (false !== ($url = $this->generateOpinionOrProposalRoute($object, $absolute))) {
            return $url;
        }
    }

    public function getAdminObjectUrl($object, $absolute = false)
    {
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
