<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\IdeaComment;

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

class IdeasController extends FOSRestController
{

    /**
     * Get idea comments.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get idea comments",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Idea does not exist",
     *  }
     * )
     *
     * @Get("/ideas/{id}/comments")
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="filter", requirements="(last|popular)", default="last")
     * @View(serializerGroups={"Comments", "UsersInfos"})
     */
    public function getIdeaCommentsAction(Idea $idea, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:IdeaComment')
                    ->getEnabledByIdea($idea, $offset, $limit, $filter);

        $comments = [];
        foreach ($paginator as $comment) {
            $comments[] = $comment;
        }

        $canReport = $this->get('capco.toggle.manager')->isActive('reporting');

        return [
            'total_count' => count($paginator),
            'comments' => $comments,
            'can_report' => $canReport,
        ];
    }

    /**
     * Get ideas.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get ideas",
     *  statusCodes={
     *    200 = "Returned when successful",
     *  }
     * )
     *
     * @Get("/ideas")
     * @QueryParam(name="from", nullable=true)
     * @QueryParam(name="to", nullable=true)
     * @View(serializerGroups={})
     */
    public function getIdeasAction(ParamFetcherInterface $paramFetcher)
    {
        $from = $paramFetcher->get('from');
        $to = $paramFetcher->get('to');

        $ideas = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:Idea')
                    ->getEnabledWith($from, $to);

        return [
            'count' => count($ideas),
        ];
    }

    /**
     * Add an idea comment.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get idea comments",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Idea does not exist",
     *  }
     * )
     *
     * @Post("/ideas/{id}/comments")
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @ParamConverter("comment", converter="fos_rest.request_body")
     * @View(serializerGroups={"Comments", "UsersInfos"})
     */
    public function postIdeaCommentsAction(Idea $idea, IdeaComment $comment, ConstraintViolationListInterface $validationErrors)
    {
        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $comment->setIdea($idea);


        $this->getDoctrine()->getManager()->persist($environment);
        $this->getDoctrine()->getManager()->flush();

        $url = $this->generateUrl('get_instance', ['name' => $instance->getName()], UrlGeneratorInterface::ABSOLUTE_URL);
        return $this->redirectView($url);
    }

}
