<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVote;
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
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Request\ParamFetcherInterface;
use FOS\RestBundle\Util\Codes;

class OpinionsController extends FOSRestController
{
    /**
     * Get an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get an opinion",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     *
     * @Get("/opinions/{id}")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}, "repository_method": "getOne"})
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
     */
    public function getOpinionAction(Opinion $opinion)
    {
        $em = $this->get('doctrine.orm.entity_manager');
        $repo = $em->getRepository('CapcoAppBundle:Opinion');
        $id = $opinion->getId();

        $opinionWithArguments = $repo->getWithArguments($id);
        $opinionWithSources = $repo->getWithSources($id);
        $opinionWithVotes = $repo->getWithVotes($id, 5);
        $opinionWithConnections = $repo->getOneWithEnabledConnectionsOrdered($id);

        if (is_object($opinionWithArguments)) {
            $opinion->setArguments($opinionWithArguments->getArguments());
        }

        if (is_object($opinionWithSources)) {
            $opinion->setSources($opinionWithSources->getSources());
        }

        if (is_object($opinionWithVotes)) {
            $opinion->setVotes($opinionWithVotes->getVotes());
        }

        if (is_object($opinionWithConnections)) {
            $opinion->setConnections($opinionWithConnections->getConnections());
        }

        $project = $opinion->getStep()->getProject();

        return [
            'opinion'          => $opinion,
            'rankingThreshold' => $project->getOpinionsRankingThreshold(),
            'opinionTerm'      => $project->getOpinionTerm(),
        ];
    }

    /**
     * Vote on an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Vote on an opinion",
     *  statusCodes={
     *    204 = "Returned when successful",
     *    400 = "Returned when opinion is not contribuable",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Put("/opinions/{id}/votes")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=204, serializerGroups={})
     */
    public function putOpinionVoteAction(Opinion $opinion, OpinionVote $vote, ConstraintViolationListInterface $validationErrors)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException('Uncontribuable opinion.');
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $user = $this->getUser();
        $previousVote = $this->get('doctrine.orm.entity_manager')
                    ->getRepository('CapcoAppBundle:OpinionVote')
                    ->findOneBy(['user' => $user, 'opinion' => $opinion]);

        if ($previousVote) {
            $opinion->incrementVotesCountByType($vote->getValue());
            $opinion->decrementVotesCountByType($previousVote->getValue());

            $previousVote->setValue($vote->getValue());
            $this->get('doctrine.orm.entity_manager')->flush();

            return $previousVote;
        }

        $vote
            ->setConfirmed(true)
            ->setOpinion($opinion)
            ->setUser($user)
        ;

        $opinion->incrementVotesCountByType($vote->getValue());
        $this->get('doctrine.orm.entity_manager')->persist($vote);
        $this->get('doctrine.orm.entity_manager')->flush();

        return $vote;
    }

    /**
     * Delete a vote on an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete a vote on an opinion",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    400 = "Returned when opinion is not contribuable or user has no vote in the opinion",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{id}/votes")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}})
     * @View(statusCode=204, serializerGroups={})
     */
    public function deleteOpinionVoteAction(Opinion $opinion)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException('Uncontribuable opinion.');
        }

        $vote = $this->get('doctrine.orm.entity_manager')
                     ->getRepository('CapcoAppBundle:OpinionVote')
                     ->findOneBy(['user' => $this->getUser(), 'opinion' => $opinion]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this opinion.');
        }

        $opinion->decrementVotesCountByType($vote->getValue());
        $this->get('doctrine.orm.entity_manager')->remove($vote);
        $this->get('doctrine.orm.entity_manager')->flush();
    }

    /**
     * Get all versions of an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all versions of an opinion",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Get("/opinions/{id}/versions")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", nullable=true)
     * @QueryParam(name="filter", requirements="(old|last|votes|favorable|comments)", default="last")
     * @View(statusCode=200, serializerGroups={"OpinionVersionPreviews", "UsersInfos"})
     */
    public function cgetOpinionVersionsAction(Opinion $opinion, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');
        $trashed = false;

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:OpinionVersion')
                    ->getEnabledByOpinion($opinion, $filter, $trashed, $offset, $limit);

        $project = $opinion->getStep()->getProject();

        $versions = [];
        foreach ($paginator as $version) {
            $versions[] = $version;
        }

        return [
            'versions'         => $versions,
            'rankingThreshold' => $project->getVersionsRankingThreshold(),
            'opinionTerm'      => $project->getOpinionTerm(),
        ];
    }

    /**
     * Get an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get an opinion version",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion or opinion version not found",
     *  }
     * )
     *
     * @Get("/opinions/{opinionId}/versions/{versionId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}, "repository_method": "getOne", "map_method_signature" = true})
     * @View(statusCode=200, serializerGroups={"OpinionVersions", "UsersInfos"})
     */
    public function getOpinionVersionAction(Opinion $opinion, OpinionVersion $version)
    {
        $project = $opinion->getStep()->getProject();

        $votes = $this->get('doctrine.orm.entity_manager')
            ->getRepository('CapcoAppBundle:OpinionVersion')
            ->getWithVotes($version->getId(), 5);

        if (is_object($votes)) {
            $version->setVotes($votes->getVotes());
        }

        return [
            'version'          => $version,
            'rankingThreshold' => $project->getVersionsRankingThreshold(),
            'opinionTerm'      => $project->getOpinionTerm(),
        ];
    }

    /**
     * Create an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Create an opinion version.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{id}/versions")
     * @ParamConverter("opinion", options={"mapping": {"id": "id"}})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionVersionAction(Request $request, Opinion $opinion)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException("Can't add a version to an uncontributable opinion.");
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new BadRequestHttpException("Can't add a version to an unversionable opinion.");
        }

        $user = $this->getUser();
        $opinionVersion = (new OpinionVersion())
            ->setAuthor($user)
            ->setParent($opinion)
        ;

        $form = $this->createForm(new OpinionVersionType(), $opinionVersion);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $opinion->setVersionsCount($opinion->getVersionsCount() + 1);
            $this->getDoctrine()->getManager()->persist($opinionVersion);
            $this->getDoctrine()->getManager()->flush();

            return $opinionVersion;
        }

        $view = $this->view($form->getErrors(true), Codes::HTTP_BAD_REQUEST);

        return $view;
    }

    /**
     * Update an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Update an opinion version",
     *  statusCodes={
     *    204 = "Returned when successful",
     *    403 = "Returned when requesting user is not the version's author",
     *    400 = "Returned when update fail",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Put("/opinions/{opinionId}/versions/{versionId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("opinionVersion", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=204, serializerGroups={})
     */
    public function putOpinionVersionAction(Request $request, Opinion $opinion, OpinionVersion $opinionVersion)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException("Can't update a version of an uncontributable opinion.");
        }

        $user = $this->getUser();
        if ($user !== $opinionVersion->getAuthor()) {
            throw new AccessDeniedException();
        }

        $form = $this->createForm(new OpinionVersionType(), $opinionVersion);
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $opinionVersion->resetVotes();
            $opinionVersion->setValidated(false);
            $this->get('doctrine.orm.entity_manager')->persist($opinionVersion);
            $this->get('doctrine.orm.entity_manager')->flush();

            return $opinionVersion;
        }

        $view = $this->view($form->getErrors(true), Codes::HTTP_BAD_REQUEST);

        return $view;
    }

    /**
     * Get all sources of an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all sources of an opinion.",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
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
        $trashed = false;

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:Source')
                    ->getByOpinion($opinion, $offset, $limit, $filter, $trashed);

        $sources = [];
        foreach ($paginator as $source) {
            $sources[] = $source;
        }

        return [
            'sources' => $sources,
        ];
    }

    /**
     * Get all sources of a version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all sources of a version.",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Get("/opinions/{opinionId}/versions/{versionId}/sources")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(serializerGroups={"Opinions", "UsersInfos"})
     */
    public function cgetOpinionVersionSourcesAction(Opinion $opinion, OpinionVersion $version, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');

        $paginator = $this->getDoctrine()->getManager()
            ->getRepository('CapcoAppBundle:Source')
            ->getByOpinionVersion($version, $offset, $limit, $filter);

        $sources = [];
        foreach ($paginator as $source) {
            $sources[] = $source;
        }

        return [
            'sources' => $sources,
        ];
    }

    /**
     * Post a source for an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post a source for an opinion.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/sources")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionSourceAction(Request $request, Opinion $opinion)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException("Can't add a source to an uncontributable opinion.");
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
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $opinion->setSourcesCount($opinion->getSourcesCount() + 1);
            $this->getDoctrine()->getManager()->persist($source);
            $this->getDoctrine()->getManager()->flush();

            return $source;
        }

        $view = $this->view($form->getErrors(true), Codes::HTTP_BAD_REQUEST);

        return $view;
    }

    /**
     * Post a source for an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post a source for an opinion version.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Returned when opinion or opinion version not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/versions/{versionId}/sources")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionVersionSourceAction(Request $request, Opinion $opinion, OpinionVersion $version)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException("Can't add a source to an uncontributable opinion.");
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new BadRequestHttpException("Can't add a version to an unversionable opinion.");
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
        $form->submit($request->request->all(), false);

        if ($form->isValid()) {
            $version->setSourcesCount($version->getSourcesCount() + 1);
            $this->getDoctrine()->getManager()->persist($source);
            $this->getDoctrine()->getManager()->flush();

            return $source;
        }

        $view = $this->view($form->getErrors(true), Codes::HTTP_BAD_REQUEST);

        return $view;
    }

    /**
     * Post an argument for an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post an argument for an opinion.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/arguments")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("argument", converter="fos_rest.request_body")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionArgumentAction(Opinion $opinion, Argument $argument, ConstraintViolationListInterface $validationErrors)
    {
        if (!$opinion->canContribute() || $opinion->getOpinionType()->getCommentSystem() === 0) {
            throw new BadRequestHttpException("Can't add an argument to an uncontributable opinion.");
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $user = $this->getUser();

        $argument
            ->setOpinion($opinion)
            ->setAuthor($user)
            ->setUpdatedAt(new \Datetime())
        ;

        $opinion->increaseArgumentsCount();
        $this->getDoctrine()->getManager()->persist($argument);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * Post an argument for an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post an argument for an opinion version.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Returned when opinion or opinion version not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/versions/{versionId}/arguments")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("argument", converter="fos_rest.request_body")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionVersionArgumentAction(Opinion $opinion, OpinionVersion $version, Argument $argument, ConstraintViolationListInterface $validationErrors)
    {
        // Fix fos_rest.request_body constructor call missing
        $argument->__construct();

        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException("Can't add a vote to an uncontributable opinion.");
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new BadRequestHttpException("Can't add a version to an unversionable opinion.");
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $user = $this->getUser();

        $argument
            ->setOpinionVersion($version)
            ->setAuthor($user)
            ->setUpdatedAt(new \Datetime())
        ;

        $version->increaseArgumentsCount();
        $this->getDoctrine()->getManager()->persist($argument);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * Put a vote for an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Put a vote for an opinion version.",
     *  statusCodes={
     *    204 = "Returned when successful",
     *    404 = "Returned when opinion or opinion version not found",
     *  }
     * )
     *
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
            throw new BadRequestHttpException("Can't add a vote to an uncontributable opinion.");
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new BadRequestHttpException("Can't add a version to an unversionable opinion.");
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors->__toString());
        }

        $user = $this->getUser();
        $previousVote = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:OpinionVersionVote')
                    ->findOneBy(['user' => $user, 'opinionVersion' => $version]);

        if ($previousVote) {
            $version->incrementVotesCountByType($vote->getValue());
            $version->decrementVotesCountByType($previousVote->getValue());

            $previousVote->setValue($vote->getValue());
            $this->getDoctrine()->getManager()->flush();

            return $previousVote;
        }

        $vote
            ->setConfirmed(true)
            ->setOpinionVersion($version)
            ->setUser($user)
        ;

        $version->incrementVotesCountByType($vote->getValue());
        $this->getDoctrine()->getManager()->persist($vote);
        $this->getDoctrine()->getManager()->flush();

        return $vote;
    }

    /**
     * Delete a vote from an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete a vote from an opinion version.",
     *  statusCodes={
     *    204 = "Returned when successful",
     *    404 = "Returned when opinion or opinion version not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}/versions/{versionId}/votes")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=204, serializerGroups={})
     */
    public function deleteOpinionVersionVoteAction(Opinion $opinion, OpinionVersion $version)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException('Uncontributable opinion.');
        }

        if (!$opinion->getOpinionType()->isVersionable()) {
            throw new BadRequestHttpException('Unversionable opinion.');
        }

        $vote = $this->getDoctrine()->getManager()
                     ->getRepository('CapcoAppBundle:OpinionVersionVote')
                     ->findOneBy(['user' => $this->getUser(), 'opinionVersion' => $version]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this opinion version.');
        }

        $version->decrementVotesCountByType($vote->getValue());
        $this->getDoctrine()->getManager()->remove($vote);
        $this->getDoctrine()->getManager()->flush();
    }

    /**
     * Get all links of an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all links of an opinion",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Get("/opinions/{id}/links")
     * @QueryParam(name="filter", requirements="(old|last)", default="last")
     * @View(statusCode=200, serializerGroups={"OpinionLinkPreviews", "UsersInfos"})
     */
    public function cgetOpinionLinksAction($id, ParamFetcherInterface $paramFetcher)
    {
        $filter = $paramFetcher->get('filter');

        $em = $this->get('doctrine.orm.entity_manager');
        $opinion = $em->getRepository('CapcoAppBundle:Opinion')
                      ->getOneWithEnabledConnectionsOrdered($id, $filter)
                    ;
        if (!$opinion) {
            throw $this->createNotFoundException('The opinion does not exist');
        }

        return [
            'links' => $opinion->getConnections(),
        ];
    }
}
