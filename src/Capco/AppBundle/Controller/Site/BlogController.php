<?php
namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Form\PostSearchType;
use Capco\AppBundle\SiteParameter\Resolver;
use JMS\Serializer\SerializationContext;
use Symfony\Component\HttpFoundation\Request;
use Overblog\GraphQLBundle\Relay\Node\GlobalId;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BlogController extends Controller
{
    /**
     * @Route("/blog/{page}", name="app_blog", requirements={"page" = "\d+"}, defaults={"_feature_flags" = "blog", "page" = 1} )
     * @Route("/blog/filter/{theme}/{page}", name="app_blog_search_theme", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all", "_feature_flags" = "blog"} )
     * @Route("/blog/filter/{theme}/{project}/{page}", name="app_blog_search_project", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all", "project" = "all", "_feature_flags" = "blog"} )
     * @Template("CapcoAppBundle:Blog:index.html.twig")
     * @Cache(smaxage="60", public=true)
     *
     * @param mixed      $page
     * @param null|mixed $theme
     * @param null|mixed $project
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
                            ? $data['theme']->getSlug()
                            : Theme::FILTER_ALL,
                        'project' => $data['project']
                            ? $data['project']->getSlug()
                            : Project::FILTER_ALL,
                    ])
                );
            }
        } else {
            $form->setData([
                'theme' => $this->get('capco.theme.repository')->findOneBySlug($theme),
                'project' => $this->get(
                    'Capco\AppBundle\Repository\ProjectRepository'
                )->findOneBySlug($project),
            ]);
        }

        $pagination = $this->get(Resolver::class)->getValue('blog.pagination.size');

        $posts = $this->get('capco.blog.post.repository')->getSearchResults(
            $pagination,
            $page,
            $theme,
            $project
        );

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if (null !== $pagination && 0 !== $pagination) {
            $nbPage = ceil(\count($posts) / $pagination);
        }

        return [
            'posts' => $posts,
            'page' => $page,
            'theme' => $theme,
            'nbPage' => $nbPage,
            'form' => $form->createView(),
        ];
    }

    /**
     * @Route("/blog/{slug}", name="app_blog_show", defaults={"_feature_flags" = "blog"} )
     * @Template("CapcoAppBundle:Blog:show.html.twig")
     *
     * @param $request
     * @param mixed $slug
     *
     * @return array
     */
    public function showAction(Request $request, $slug)
    {
        $post = $this->get('capco.blog.post.repository')->getPublishedBySlug($slug);

        if (!$post) {
            throw new NotFoundHttpException('Could not find a published article for this slug.');
        }

        return ['post' => $post];
    }
}
