<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Source;

use Capco\AppBundle\Form\ApiSourceType;



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
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\QueryParam;

use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Request\ParamFetcherInterface;

class OpinionsController extends FOSRestController
{
    /**
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
     * @Get("/opinions/{id}/versions")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(serializerGroups={"OpinionVersions", "UsersInfos"})
     */
    public function cgetOpinionVersionsAction(Opinion $opinion, ParamFetcherInterface $paramFetcher)
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
     * @Get("/opinions/{id}/sources")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(serializerGroups={"Opinions", "UsersInfos"})
     */
    public function cgetOpinionSourcesAction(Opinion $opinion, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:Source')
                    ->getOneByOpinion($opinion, $offset, $limit, $filter);

        $sources = [];
        foreach ($paginator as $source) {
            $sources[] = $source;
        }

        return [
            'sources' => $sources,
            'isOpinionContributable' => $opinion->canContribute(),
        ];
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/sources")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionSourceAction(Request $request, Opinion $opinion)
    {
        if (!$opinion->canContribute()) {
            throw new \Exception("Can't add a source to an uncontributable opinion.", 1);
        }

        $user = $this->getUser();
        $source = (new Source())
                    ->setAuthor($user)
                    ->setType(Source::LINK)
                    ->setOpinion($opinion)
                    ->setIsEnabled(true)
                    ->setUpdatedAt(new \Datetime())
                ;

        $form = $this->createForm(new ApiSourceType(), $source);
        $form->handleRequest($request);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()->getManager()->persist($source);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/versions/{versionId}/sources")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionVersionSourceAction(Request $request, Opinion $opinion, OpinionVersion $version)
    {
        if (!$opinion->canContribute()) {
            throw new \Exception("Can't add a source to an uncontributable opinion.", 1);
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new \Exception("Can't add a version to an unversionable opinion.", 1);
        }

        $user = $this->getUser();
        $source = (new Source())
                    ->setAuthor($user)
                    ->setType(Source::LINK)
                    ->setOpinionVersion($version)
                    ->setIsEnabled(true)
                    ->setUpdatedAt(new \Datetime())
                ;

        $form = $this->createForm(new ApiSourceType(), $source);
        $form->handleRequest($request);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()->getManager()->persist($source);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/versions/{versionId}/arguments")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("argument", converter="fos_rest.request_body")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionVersionArgumentAction(Opinion $opinion, OpinionVersion $version, Argument $argument, ConstraintViolationListInterface $validationErrors)
    {
        if (!$opinion->canContribute()) {
            throw new \Exception("Can't add a vote to an uncontributable opinion.", 1);
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new \Exception("Can't add a version to an unversionable opinion.", 1);
        }

        $user = $this->getUser();

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $argument
            ->setOpinionVersion($version)
            ->setAuthor($user)
            ->setUpdatedAt(new \Datetime())
        ;

        $this->getDoctrine()->getManager()->persist($argument);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Put("/opinions/{opinionId}/versions/{versionId}/votes")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=204, serializerGroups={})
     */
    public function putOpinionVersionVoteAction(Opinion $opinion, OpinionVersion $version, OpinionVersionVote $vote, ConstraintViolationListInterface $validationErrors)
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

            $version->incrementVoteCountByValue($vote->getValue());
            $version->decrementVoteCountByValue($previousVote->getValue());

            $previousVote->setValue($vote->getValue());
            $this->getDoctrine()->getManager()->flush();
            return;
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $vote
            ->setConfirmed(true)
            ->setOpinionVersion($version)
            ->setUser($user)
        ;

        $version->incrementVoteCountByValue($vote->getValue());
        $this->getDoctrine()->getManager()->persist($vote);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}/versions/{versionId}/votes")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @View()
     */
    public function deleteOpinionVersionVoteAction(Opinion $opinion, OpinionVersion $version)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException("Uncontributable opinion.");
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new BadRequestHttpException("Unversionable opinion.");
        }

        $vote = $this->getDoctrine()->getManager()
                     ->getRepository('CapcoAppBundle:OpinionVersionVote')
                     ->findOneBy(['user' => $this->getUser(), 'opinionVersion' => $version]);

        if (!$vote) {
            throw new BadRequestHttpException("You have not voted for this opinion version.");
        }

        $version->decrementVoteCountByValue($vote->getValue());
        $this->getDoctrine()->getManager()->remove($vote);
        $this->getDoctrine()->getManager()->flush();
    }


    /**
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
