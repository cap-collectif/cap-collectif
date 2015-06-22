<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Idea;

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

use Nelmio\ApiDocBundle\Annotation\ApiDoc;

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
     * @View(serializerGroups={"Comments", "UsersInfos"})
     */
    public function getIdeaCommentsAction(Idea $idea)
    {
        return $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:IdeaComment')
                    ->getEnabledByIdea($idea);
    }

}
