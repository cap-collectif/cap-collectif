<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Opinion;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Capco\AppBundle\Form\OpinionVersionType;
use Capco\AppBundle\CapcoAppBundleEvents;

use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;

use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Request\ParamFetcherInterface;

class OpinionsController extends FOSRestController
{

    /**
     * Get opinion versions.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get opinion versions",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Post does not exist",
     *  }
     * )
     *
     * @Get("/opinions/{id}/versions")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(serializerGroups={"Opinions", "UsersInfos"})
     */
    public function getOpinionVersionsAction(Opinion $opinion, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:Opinion')
                    ->getEnabledVersionsByOpinion($opinion, $offset, $limit, $filter);

        $opinions = [];
        foreach ($paginator as $opinion) {
            $opinions[] = $opinion;
        }

        return [
            'versions' => $opinions,
            'isOpinionContributable' => $opinion->canContribute(),
        ];
    }


    /**
     * Add an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post an opinion version",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Idea does not exist",
     *  }
     * )
     *
     * @Post("/opinions/{id}/versions")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionVersionAction(Request $request, Opinion $opinion)
    {
        if (!$opinion->canContribute()) {
            throw new \Exception("Can't add a version to an uncontributable opinion.", 1);
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new \Exception("Can't add a version to an unversionable opinion.", 1);
        }

        $user = $this->getUser();
        $opinionVersion = (new Opinion())
                    ->setAuthor($user)
                    ->setParent($opinion)
                ;

        $form = $this->createForm(new OpinionVersionType(), $opinionVersion);
        $form->handleRequest($request);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()->getManager()->persist($opinionVersion);
        $this->getDoctrine()->getManager()->flush();
    }
}
