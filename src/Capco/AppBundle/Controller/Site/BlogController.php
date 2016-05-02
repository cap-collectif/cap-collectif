<?php

namespace Capco\AppBundle\Controller\Site;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Capco\AppBundle\Form\PostSearchType;
use Capco\AppBundle\Entity\Theme;
use Capco\AppBundle\Entity\Project;

class BlogController extends Controller
{
    /**
     * @Route("/blog/{page}", name="app_blog", requirements={"page" = "\d+"}, defaults={"_feature_flags" = "blog", "page" = 1} )
     * @Route("/blog/filter/{theme}/{page}", name="app_blog_search_theme", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all", "_feature_flags" = "blog"} )
     * @Route("/blog/filter/{theme}/{project}/{page}", name="app_blog_search_project", requirements={"page" = "\d+"}, defaults={"page" = 1, "theme" = "all", "project" = "all", "_feature_flags" = "blog"} )
     * @Template("CapcoAppBundle:Blog:index.html.twig")
     * @Cache(smaxage="60", public=true)
     */
    public function indexAction(Request $request, $page, $theme = null, $project = null)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_blog');

        $form = $this->createForm(new PostSearchType($this->get('capco.toggle.manager')), null, [
            'action' => $currentUrl,
            'method' => 'POST',
        ]);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                // redirect to the results page (avoids reload alerts)
                $data = $form->getData();

                return $this->redirect($this->generateUrl('app_blog_search_project', [
                    'theme' => array_key_exists('theme', $data) && $data['theme'] ? $data['theme']->getSlug() : Theme::FILTER_ALL,
                    'project' => $data['project'] ? $data['project']->getSlug() : Project::FILTER_ALL,
                ]));
            }
        } else {
            $form->setData([
                'theme' => $em->getRepository('CapcoAppBundle:Theme')->findOneBySlug($theme),
                'project' => $em->getRepository('CapcoAppBundle:Project')->findOneBySlug($project),
            ]);
        }

        $pagination = $this->get('capco.site_parameter.resolver')->getValue('blog.pagination.size');

        $posts = $this->get('capco.blog.post.repository')->getSearchResults(
            $pagination,
            $page,
            $theme,
            $project
        );

        //Avoid division by 0 in nbPage calculation
        $nbPage = 1;
        if ($pagination !== null && $pagination !== 0) {
            $nbPage = ceil(count($posts) / $pagination);
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
     *
     * @return array
     */
    public function showAction(Request $request, $slug)
    {
        $post = $this->get('capco.blog.post.repository')->getPublishedBySlug($slug);

        if (!$post) {
            throw new NotFoundHttpException('Could not find a published article for this slug.');
        }

        return [
            'post' => $post,
        ];
    }
}
