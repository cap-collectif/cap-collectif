<?php

namespace Capco\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\Request;

class BlogController extends Controller
{
    /**
     * @Route("/blog/{page}", name="app_blog", requirements={"page" = "\d+"}, defaults={"_feature_flag" = "blog", "page" = 1} )
     * @Template()
     * @param $request
     * @return array
     */
    public function indexAction(Request $request, $page)
    {
        $posts = $this->get('capco.blog.post.repository')->getPublishedPosts(
            $page,
            $this->get('capco.site_parameter.resolver')->getValue('blog.pagination.size')
        );
        return [
            'posts' => $posts
        ];
    }

    /**
     * @Route("/blog/{slug}", name="app_blog_show", defaults={"_feature_flag" = "blog"} )
     * @Template()
     * @param $request
     * @return array
     */
    public function showAction(Request $request, $slug)
    {
        $post = $this->get('capco.blog.post.repository')->getPublishedBySlug($slug);

        if (!$post) {
            throw new NotFoundHttpException('Could not find a published article for this slug.');
        }

        return [
            'post' => $post
        ];
    }
}
