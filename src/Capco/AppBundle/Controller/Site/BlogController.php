<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Post;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Form\PostSearchType;
use Capco\AppBundle\Repository\PostRepository;
use Capco\AppBundle\Repository\ProjectRepository;
use Capco\AppBundle\Repository\ThemeTranslationRepository;
use Capco\AppBundle\SiteParameter\SiteParameterResolver;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController as Controller;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BlogController extends Controller
{
    /**
     * @Route("/blog/{page}", name="app_blog", requirements={"page" = "\d+"}, defaults={"_feature_flags" = "blog", "page" = 1} )
     * @Route("/blog/filter/{theme}/{page}", name="app_blog_search_theme", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all", "_feature_flags" = "blog"} )
     * @Route("/blog/filter/{theme}/{project}/{page}", name="app_blog_search_project", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all", "project" = "all", "_feature_flags" = "blog"} )
     * @Template("CapcoAppBundle:Blog:index.html.twig")
     *
     * @param mixed      $page
     * @param null|mixed $theme
     * @param null|mixed $project
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function indexAction(Request $request, $page, $theme = null, $project = null)
    {
        $currentUrl = $this->generateUrl('app_blog');

        $form = $this->createForm(PostSearchType::class, null, [
            'action' => $currentUrl,
            'method' => 'POST',
        ]);

        if ('POST' === $request->getMethod()) {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect(
                    $this->generateUrl('app_blog_search_project', [
                        'theme' => isset($data['theme'])
                            ? $data['theme']->translate()->getSlug()
                            : Theme::FILTER_ALL,
                        'project' => $data['project']
                            ? $data['project']->getSlug()
                            : Project::FILTER_ALL,
                    ])
                );
            }
        } else {
            $themeObject = $theme
                ? $this->get(ThemeTranslationRepository::class)->findOneBySlug($theme)
                : null;
            $projectObject = $this->get(ProjectRepository::class)->findOneBySlug($project);
            $form->setData([
                'theme' => $theme ? $themeObject : null,
                'project' => $projectObject,
            ]);
        }

        $pagination = $this->get(SiteParameterResolver::class)->getValue('blog.pagination.size');

        $posts = $this->get(PostRepository::class)->getSearchResults(
            $pagination,
            $page,
            $themeObject ? $themeObject->getSlug() : Theme::FILTER_ALL,
            $projectObject ? $projectObject->getSlug() : Project::FILTER_ALL,
            true,
            $this->getUser()
        );

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if (null !== $pagination && 0 !== $pagination) {
            $nbPage = ceil(\count($posts) / $pagination);
        }

        return [
            'posts' => $posts,
            'page' => $page,
            'locale' => $request->getLocale(),
            'theme' => $theme,
            'nbPage' => $nbPage,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/blog/{slug}", name="app_blog_show", defaults={"_feature_flags" = "blog"} )
     * @Template("CapcoAppBundle:Blog:show.html.twig")
     */
    public function showAction(Request $request, string $slug)
    {
        /** @var Post $post */
        $post = $this->get(PostRepository::class)->getPublishedBySlug($slug);

        if (!$post) {
            throw new NotFoundHttpException('Could not find a published article for this slug.');
        }

        $viewer = $this->getUser();

        return ['post' => $post, 'viewerDidAuthor' => $viewer ? $post->isAuthor($viewer) : false];
    }
}
