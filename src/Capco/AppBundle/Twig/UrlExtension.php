<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\AbstractComment;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Source;
use Capco\AppBundle\Entity\Theme;
use Capco\UserBundle\Entity\User;
use Symfony\Component\Routing\Router;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\AppBundle\Resolver\StepResolver;

class UrlExtension extends \Twig_Extension
{
    protected $router;
    protected $commentResolver;
    protected $stepResolver;

    public function __construct(Router $router, CommentResolver $commentResolver, StepResolver $stepResolver)
    {
        $this->router = $router;
        $this->commentResolver = $commentResolver;
        $this->stepResolver = $stepResolver;
    }

    /**
     * Returns the name of the extension.
     *
     * @return string The extension name
     */
    public function getName()
    {
        return 'capco_url';
    }

    public function getFilters()
    {
        return array(
            new \Twig_SimpleFilter('capco_url', array($this, 'getObjectUrl')),
        );
    }

    public function getObjectUrl($object, $absolute = false)
    {
        if ($object instanceof Idea) {
            return $this->router->generate('app_idea_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof Post) {
            return $this->router->generate('app_blog_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof AbstractComment) {
            return $this->commentResolver->getUrlOfRelatedObject($object, $absolute);
        }

        if ($object instanceof Argument) {
            return $this->router->generate('app_consultation_show_opinion', ['consultationSlug' => $object->getOpinion()->getStep()->getConsultation()->getSlug(), 'stepSlug' => $object->getOpinion()->getStep()->getSlug(), 'opinionTypeSlug' => $object->getOpinion()->getOpinionType()->getSlug(), 'opinionSlug' => $object->getOpinion()->getSlug()], $absolute);
        }

        if ($object instanceof Consultation) {
            return $this->stepResolver->getFirstStepLinkForConsultation($object, $absolute);
        }

        if ($object instanceof Event) {
            return $this->router->generate('app_event_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof Opinion) {
            return $this->router->generate('app_consultation_show_opinion', ['consultationSlug' => $object->getStep()->getConsultation()->getSlug(), 'stepSlug' => $object->getStep()->getSlug(), 'opinionTypeSlug' => $object->getOpinionType()->getSlug(), 'opinionSlug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof Source) {
            return $this->router->generate('app_consultation_show_opinion', ['consultationSlug' => $object->getOpinion()->getStep()->getConsultation()->getSlug(), 'stepSlug' => $object->getOpinion()->getStep()->getSlug(), 'opinionTypeSlug' => $object->getOpinion()->getOpinionType()->getSlug(), 'opinionSlug' => $object->getOpinion()->getSlug()], $absolute);
        }

        if ($object instanceof Theme) {
            return $this->router->generate('app_theme_show', ['slug' => $object->getSlug()], $absolute);
        }

        if ($object instanceof User) {
            return $this->router->generate('capco_user_profile_show_all', ['slug' => $object->getSlug()], $absolute);
        }

        return;
    }
}
