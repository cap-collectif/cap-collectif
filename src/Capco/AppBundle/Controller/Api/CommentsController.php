<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\AbstractComment;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\QueryParam;

use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Request\ParamFetcherInterface;

class CommentsController extends FOSRestController
{
    /**
     * Get comments.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get comments",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Comment does not exist",
     *  }
     * )
     *
     * @Get("/comments")
     * @QueryParam(name="from", nullable=true)
     * @QueryParam(name="to", nullable=true)
     * @View(serializerGroups={})
     */
    public function getCommentsAction(ParamFetcherInterface $paramFetcher)
    {
        $from = $paramFetcher->get('from');
        $to = $paramFetcher->get('to');

        $comments = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:AbstractComment')
                    ->getEnabledWith($from, $to);

        return [
            'count' => count($comments),
        ];
    }


}
