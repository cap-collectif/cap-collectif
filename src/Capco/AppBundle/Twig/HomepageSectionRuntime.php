<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Section\Section;
use Capco\AppBundle\Repository\HighlightedContentRepository;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ProposalRepository;
use Capco\AppBundle\Repository\SocialNetworkRepository;
use Capco\AppBundle\Repository\ThemeRepository;
use Capco\AppBundle\Repository\VideoRepository;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Serializer\SerializerInterface;
use Twig\Environment;
use Twig\Extension\RuntimeExtensionInterface;

class HomepageSectionRuntime implements RuntimeExtensionInterface
{
    private readonly HighlightedContentRepository $highlightedContentRepository;
    private readonly SerializerInterface $serializer;
    private readonly Environment $twig;
    private readonly VideoRepository $videoRepository;
    private readonly ProjectRepository $projectRepository;
    private readonly TokenStorageInterface $tokenStorage;
    private readonly ThemeRepository $themeRepository;
    private readonly PostRepository $postRepository;
    private readonly SocialNetworkRepository $networkRepository;
    private readonly ProposalRepository $proposalRepository;

    public function __construct(
        HighlightedContentRepository $highlightedContentRepository,
        VideoRepository $videoRepository,
        ProjectRepository $projectRepository,
        ThemeRepository $themeRepository,
        PostRepository $postRepository,
        SocialNetworkRepository $networkRepository,
        ProposalRepository $proposalRepository,
        SerializerInterface $serializer,
        Environment $twig,
        TokenStorageInterface $tokenStorage
    ) {
        $this->highlightedContentRepository = $highlightedContentRepository;
        $this->serializer = $serializer;
        $this->twig = $twig;
        $this->videoRepository = $videoRepository;
        $this->projectRepository = $projectRepository;
        $this->tokenStorage = $tokenStorage;
        $this->themeRepository = $themeRepository;
        $this->postRepository = $postRepository;
        $this->networkRepository = $networkRepository;
        $this->proposalRepository = $proposalRepository;
    }

    public function getHighlightedContent(?Section $section = null): string
    {
        $highlighteds = $this->highlightedContentRepository->getAllOrderedByPosition(4);
        $props = $this->serializer->serialize(['highlighteds' => $highlighteds], 'json', [
            'groups' => [
                'HighlightedContent',
                'Posts',
                'Events',
                'Projects',
                'Themes',
                'ThemeDetails',
                'Default',
                'Proposals',
            ],
        ]);

        return $this->twig->render(
            '@CapcoApp/Homepage/highlighted.html.twig',
            compact('props', 'section')
        );
    }

    public function getLastVideos(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ): string {
        $max ??= 4;
        $offset ??= 0;
        $videos = $this->videoRepository->getLast($max, $offset);

        return $this->twig->render(
            '@CapcoApp/Homepage/videos.html.twig',
            compact('videos', 'section')
        );
    }

    public function getLastProjects(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ): string {
        $max ??= 3;
        $user = ($token = $this->tokenStorage->getToken()) ? $token->getUser() : null;
        $count = $this->projectRepository->countPublished($user);

        return $this->twig->render(
            '@CapcoApp/Homepage/lastProjects.html.twig',
            compact('max', 'count', 'section')
        );
    }

    public function getCustomProjects(?Section $section = null): string
    {
        $user = ($token = $this->tokenStorage->getToken()) ? $token->getUser() : null;
        $count = $this->projectRepository->countPublished($user);
        $projectsCount = $section->getSectionProjects()->count();

        return $this->twig->render(
            '@CapcoApp/Homepage/listCustomProjects.html.twig',
            compact('count', 'section', 'projectsCount')
        );
    }

    public function getLastThemes(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ): string {
        $max ??= 4;
        $offset ??= 0;
        $topics = $this->themeRepository->getLast($max, $offset);

        return $this->twig->render(
            '@CapcoApp/Homepage/lastThemes.html.twig',
            compact('topics', 'section')
        );
    }

    public function getLastPosts(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ): string {
        $max ??= 4;
        $offset ??= 0;
        $posts = $this->postRepository->getLast($max, $offset);

        return $this->twig->render(
            '@CapcoApp/Homepage/lastPosts.html.twig',
            compact('posts', 'section')
        );
    }

    public function getSocialNetworks(?Section $section = null): string
    {
        $socialNetworks = $this->networkRepository->getEnabled();

        return $this->twig->render(
            '@CapcoApp/Homepage/socialNetworks.html.twig',
            compact('socialNetworks', 'section')
        );
    }

    public function getLastProposals(
        ?int $max = 4,
        ?int $offset = 0,
        ?Section $section = null
    ): string {
        if ($section && $section->getStep() && $section->getStep()->isCollectStep()) {
            $results = $this->proposalRepository->getLastByStep($max, $offset, $section->getStep());
        } else {
            $results = $this->proposalRepository->getLast($max, $offset);
        }

        $proposals = array_map(static function (Proposal $proposal) {
            return $proposal->getId();
        }, $results);

        return $this->twig->render(
            '@CapcoApp/Homepage/lastProposals.html.twig',
            compact('proposals', 'section')
        );
    }

    public function getMetricsSection(?Section $section): string
    {
        $props = $this->serializer->serialize($section, 'json', [
            'groups' => ['Section'],
        ]);

        return $this->twig->render('@CapcoApp/Homepage/metrics.html.twig', compact('props'));
    }

    public function getProjectsMap(?Section $section): string
    {
        $user = ($token = $this->tokenStorage->getToken()) ? $token->getUser() : null;
        $count = $this->projectRepository->countPublished($user);

        return $this->twig->render('@CapcoApp/Homepage/projectsMap.html.twig', compact('count'));
    }
}
