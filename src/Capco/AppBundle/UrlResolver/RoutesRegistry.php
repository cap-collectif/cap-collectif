<?php

namespace Capco\AppBundle\UrlResolver;

use Capco\AppBundle\Entity\Event;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Selection;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Entity\Steps\OtherStep;
use Capco\AppBundle\Entity\Steps\PresentationStep;
use Capco\AppBundle\Entity\Steps\QuestionnaireStep;
use Capco\AppBundle\Entity\Steps\RankingStep;
use Capco\AppBundle\Entity\Steps\SynthesisStep;
use Capco\AppBundle\Entity\Theme;
use Capco\UserBundle\Entity\User;

class RoutesRegistry
{
    /**
     * @var array
     */
    protected static $routes = [
        Opinion::class => 'app_project_show_opinion',
        OpinionVersion::class => 'app_project_show_opinion_version',
        Proposal::class => 'app_project_show_proposal',
        Post::class => 'app_blog_show',
        Event::class => 'app_event_show',
        Theme::class => 'app_theme_show',
        User::class => 'capco_user_profile_show_all',
        ConsultationStep::class => 'app_project_show_consultation',
        PresentationStep::class => 'app_project_show_presentation',
        OtherStep::class => 'app_project_show_step',
        SynthesisStep::class => 'app_project_show_synthesis',
        RankingStep::class => 'app_project_show_ranking',
        CollectStep::class => 'app_project_show_collect',
        Selection::class => 'app_project_show_selection',
        QuestionnaireStep::class => 'app_project_show_questionnaire'
    ];

    /**
     * gets a value from the registry.
     *
     * @param string $key
     *
     * @static
     *
     * @return string
     */
    public static function get(string $key): string
    {
        return self::$routes[$key] ?? '';
    }
}