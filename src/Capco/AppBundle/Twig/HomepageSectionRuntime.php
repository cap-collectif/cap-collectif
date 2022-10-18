<?php

namespace Capco\AppBundle\Twig;

use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\Section;
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
    private HighlightedContentRepository $highlightedContentRepository;
    private SerializerInterface $serializer;
    private Environment $twig;
    private VideoRepository $videoRepository;
    private ProjectRepository $projectRepository;
    private TokenStorageInterface $tokenStorage;
    private ThemeRepository $themeRepository;
    private PostRepository $postRepository;
    private SocialNetworkRepository $networkRepository;
    private ProposalRepository $proposalRepository;

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
            'CapcoAppBundle:Homepage:highlighted.html.twig',
            compact('props', 'section')
        );
    }

    public function getLastVideos(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ): string {
        $max = $max ?? 4;
        $offset = $offset ?? 0;
        $videos = $this->videoRepository->getLast($max, $offset);

        return $this->twig->render(
            'CapcoAppBundle:Homepage:videos.html.twig',
            compact('videos', 'section')
        );
    }

    public function getLastProjects(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ): string {
        $max = $max ?? 3;
        $user = ($token = $this->tokenStorage->getToken()) ? $token->getUser() : null;
        $count = $this->projectRepository->countPublished($user);

        return $this->twig->render(
            'CapcoAppBundle:Homepage:lastProjects.html.twig',
            compact('max', 'count', 'section')
        );
    }

    public function getCustomProjects(?Section $section = null): string
    {
        $user = ($token = $this->tokenStorage->getToken()) ? $token->getUser() : null;
        $count = $this->projectRepository->countPublished($user);
        $projectsCount = $section->getSectionProjects()->count();

        return $this->twig->render(
            'CapcoAppBundle:Homepage:listCustomProjects.html.twig',
            compact('count', 'section', 'projectsCount')
        );
    }

    public function getLastThemes(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ): string {
        $max = $max ?? 4;
        $offset = $offset ?? 0;
        $topics = $this->themeRepository->getLast($max, $offset);

        return $this->twig->render(
            'CapcoAppBundle:Homepage:lastThemes.html.twig',
            compact('topics', 'section')
        );
    }

    public function getLastPosts(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ): string {
        $max = $max ?? 4;
        $offset = $offset ?? 0;
        $posts = $this->postRepository->getLast($max, $offset);

        return $this->twig->render(
            'CapcoAppBundle:Homepage:lastPosts.html.twig',
            compact('posts', 'section')
        );
    }

    public function getSocialNetworks(?Section $section = null): string
    {
        $socialNetworks = $this->networkRepository->getEnabled();

        return $this->twig->render(
            'CapcoAppBundle:Homepage:socialNetworks.html.twig',
            compact('socialNetworks', 'section')
        );
    }

    public function getLastProposals(
        ?int $max = null,
        ?int $offset = null,
        ?Section $section = null
    ): string {
        $max = $max ?? 4;
        $offset = $offset ?? 0;
        if ($section && $section->getStep() && $section->getStep()->isCollectStep()) {
            $results = $this->proposalRepository->getLastByStep($max, $offset, $section->getStep());
        } else {
            $results = $this->proposalRepository->getLast($max, $offset);
        }

        $proposals = array_map(static function (Proposal $proposal) {
            return $proposal->getId();
        }, $results);

        return $this->twig->render(
            'CapcoAppBundle:Homepage:lastProposals.html.twig',
            compact('proposals', 'section')
        );
    }

    public function getMetricsSection(?Section $section): string
    {
        $props = $this->serializer->serialize($section, 'json', [
            'groups' => ['Section'],
        ]);

        return $this->twig->render('CapcoAppBundle:Homepage:metrics.html.twig', compact('props'));
    }

    public function getProjectsMap(?Section $section): string
    {
        $user = ($token = $this->tokenStorage->getToken()) ? $token->getUser() : null;
        $count = $this->projectRepository->countPublished($user);
        return $this->twig->render('CapcoAppBundle:Homepage:projectsMap.html.twig', compact('count'));
    }
}
