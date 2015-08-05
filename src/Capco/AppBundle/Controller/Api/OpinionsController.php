<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Capco\AppBundle\Form\OpinionVersionType;
use Symfony\Component\Validator\ConstraintViolationListInterface;
use Capco\AppBundle\CapcoAppBundleEvents;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;

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
     * Get an opinion version.
     *
     * @Get("/opinions/{opinionId}/versions/{versionId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @View(serializerGroups={"OpinionVersions", "UsersInfos"})
     */
    public function getOpinionVersionAction(Opinion $opinion, OpinionVersion $version)
    {
        return [
            'version' => $version,
        ];
    }


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
     * @View(serializerGroups={"OpinionVersions", "UsersInfos"})
     */
    public function getOpinionVersionsAction(Opinion $opinion, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:OpinionVersion')
                    ->getEnabledByOpinion($opinion, $offset, $limit, $filter);

        $versions = [];
        foreach ($paginator as $version) {
            $versions[] = $version;
        }

        return [
            'versions' => $versions,
            'isOpinionContributable' => $opinion->canContribute(),
        ];
    }


    /**
     * Add an opinion version vote.
     *
     * @Security("has_role('ROLE_USER')")
     * @Put("/opinions/{opinionId}/versions/{versionId}/votes")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionVersionVoteAction(Opinion $opinion, OpinionVersion $version, OpinionVersionVote $vote, ConstraintViolationListInterface $validationErrors)
    {
        if (!$opinion->canContribute()) {
            throw new \Exception("Can't add a vote to an uncontributable opinion.", 1);
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new \Exception("Can't add a version to an unversionable opinion.", 1);
        }

        $user = $this->getUser();
        $previousVote = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:OpinionVersionVote')
                    ->findOneBy(['user' => $user, 'opinionVersion' => $version]);

        if ($previousVote) {
            $previousVote->setValue($vote->getValue());
            $this->getDoctrine()->getManager()->flush();
            return ;
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $vote->setConfirmed(true);

        $this->getDoctrine()->getManager()->persist($vote);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * Add an opinion version vote.
     *
     * @Security("has_role('ROLE_USER')")
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
        $opinionVersion = (new OpinionVersion())
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
