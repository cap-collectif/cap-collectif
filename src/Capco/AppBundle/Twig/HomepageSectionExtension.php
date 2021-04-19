<?php

namespace Capco\AppBundle\Twig;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class HomepageSectionExtension extends AbstractExtension
{
    public function getFunctions(): array
    {
        return [
            new TwigFunction(
                'get_highlighted_content',
                [HomepageSectionRuntime::class, 'getHighlightedContent'],
                ['is_safe' => ['html']]
            ),
            new TwigFunction(
                'get_last_videos',
                [HomepageSectionRuntime::class, 'getLastVideos'],
                ['is_safe' => ['html']]
            ),
            new TwigFunction(
                'get_last_projects',
                [HomepageSectionRuntime::class, 'getLastProjects'],
                ['is_safe' => ['html']]
            ),
            new TwigFunction(
                'get_custom_projects',
                [HomepageSectionRuntime::class, 'getCustomProjects'],
                ['is_safe' => ['html']]
            ),
            new TwigFunction(
                'get_last_themes',
                [HomepageSectionRuntime::class, 'getLastThemes'],
                ['is_safe' => ['html']]
            ),
            new TwigFunction(
                'get_last_posts',
                [HomepageSectionRuntime::class, 'getLastPosts'],
                ['is_safe' => ['html']]
            ),
            new TwigFunction(
                'get_social_networks',
                [HomepageSectionRuntime::class, 'getSocialNetworks'],
                ['is_safe' => ['html']]
            ),
            new TwigFunction(
                'get_last_proposals',
                [HomepageSectionRuntime::class, 'getLastProposals'],
                ['is_safe' => ['html']]
            ),
            new TwigFunction(
                'get_metrics_section',
                [HomepageSectionRuntime::class, 'getMetricsSection'],
                ['is_safe' => ['html']]
            ),
        ];
    }
}
