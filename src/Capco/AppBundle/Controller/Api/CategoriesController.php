<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Post as BlogPost;
use Capco\AppBundle\Entity\PostComment as PostComment;
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\AbstractCommentChangedEvent;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Request\ParamFetcherInterface;

class CategoriesController extends FOSRestController
{
    /**
     * @Get("/categories")
     * @View(serializerGroups={"Categories"})
     */
    public function getCategoriesAction()
    {
        $categories = $this->getDoctrine()->getManager()
                      ->getRepository('CapcoAppBundle:Category')
                      ->findBy(['isEnabled' => true]);

        return $categories;
    }

}
