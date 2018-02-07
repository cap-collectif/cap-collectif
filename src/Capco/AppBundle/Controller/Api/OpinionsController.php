<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\OpinionVersionVote;
use Capco\AppBundle\Entity\OpinionVote;
use Capco\AppBundle\Entity\Project;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Steps\ConsultationStep;
use Capco\AppBundle\Form\OpinionForm;
use Capco\AppBundle\Form\OpinionVersionType;
use Capco\AppBundle\Form\ReportingType;
use Doctrine\DBAL\Exception\DriverException;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Swarrot\Broker\Message;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Validator\ConstraintViolationListInterface;

class OpinionsController extends FOSRestController
{
    /**
     * @Get("/opinions/{id}")
     * @ParamConverter("opinion", options={
     *  "mapping": {"id": "id"},
     *  "repository_method": "getOne",
     *  "map_method_signature" = true
     * })
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias", "Steps"})
     */
    public function getOpinionAction(Opinion $opinion)
    {
        $em = $this->getDoctrine()->getManager();
        $repo = $em->getRepository('CapcoAppBundle:Opinion');
        $id = $opinion->getId();

        $opinionWithArguments = $repo->getWithArguments($id);
        $opinionWithSources = $repo->getWithSources($id);
        $opinionWithVotes = $repo->getWithVotes($id, 5);

        if (is_object($opinionWithArguments)) {
            $opinion->setArguments($opinionWithArguments->getArguments());
        }

        if (is_object($opinionWithSources)) {
            $opinion->setSources($opinionWithSources->getSources());
        }

        if (is_object($opinionWithVotes)) {
            $opinion->setVotes($opinionWithVotes->getVotes());
        }

        $project = $opinion->getStep()->getProject();

        return [
            'opinion' => $opinion,
            'rankingThreshold' => $project->getOpinionsRankingThreshold(),
            'opinionTerm' => $project->getOpinionTerm(),
        ];
    }

    /**
     * @ApiDoc(
     *  resource=true,
     *  description="Create an opinion.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Returned when opinion not found",
     *  }
     * )
     *
     * @Post("/projects/{projectId}/steps/{stepId}/opinion_types/{typeId}/opinions")
     * @ParamConverter("project", options={"mapping": {"projectId": "id"}})
     * @ParamConverter("step", options={"mapping": {"stepId": "id"}})
     * @ParamConverter("type", options={"mapping": {"typeId": "id"}})
     * @Security("has_role('ROLE_USER')")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionAction(Request $request, Project $project, ConsultationStep $step, OpinionType $type)
    {
        if (!$step->canContribute()) {
            throw new BadRequestHttpException('This step is not contribuable.');
        }

        if (!$type->getIsEnabled()) {
            throw new BadRequestHttpException('This opinionType is not enabled.');
        }

        $author = $this->getUser();
        $repo = $this->get('capco.opinion.repository');

        if (count($repo->findCreatedSinceIntervalByAuthor($author, 'PT1M')) >= 2) {
            throw new BadRequestHttpException('You contributed to many times.');
        }

        $opinion = (new Opinion())
          ->setAuthor($author)
          ->setStep($step)
          ->setIsEnabled(true)
          ->setOpinionType($type)
          ;

        $form = $this->createForm(OpinionForm::class, $opinion);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($opinion);
        $em->flush();

        $this->get('swarrot.publisher')->publish('opinion.create', new Message(
            json_encode([
                'opinionId' => $opinion->getId(),
            ])
        ));

        return $opinion;
    }

    /**
     * @Put("/opinions/{id}")
     * @ParamConverter("opinion", options={
     *  "mapping": {"id": "id"},
     *  "repository_method": "getOne",
     *  "map_method_signature" = true
     * })
     * @Security("has_role('ROLE_USER')")
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
     */
    public function putOpinionAction(Request $request, Opinion $opinion)
    {
        if ($this->getUser() !== $opinion->getAuthor()) {
            throw new AccessDeniedHttpException();
        }

        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException('Uncontribuable opinion.');
        }

        $form = $this->createForm(OpinionForm::class, $opinion);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $opinion->resetVotes();
        $opinion->setValidated(false);
        $this->getDoctrine()->getManager()->flush();

        $this->get('swarrot.publisher')->publish('opinion.update', new Message(
            json_encode([
                'opinionId' => $opinion->getId(),
            ])
        ));

        return $opinion;
    }

    /**
     * Delete an opinion.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete an opinion",
     *  statusCodes={
     *    204 = "Returned when successful",
     *    403 = "Returned when requesting user is not the opinion's author",
     *    400 = "Returned when delete fail",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @View(statusCode=204, serializerGroups={})
     */
    public function deleteOpinionAction(Request $request, Opinion $opinion)
    {
        $user = $this->getUser();
        if ($user !== $opinion->getAuthor()) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($opinion);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * @ApiDoc(
     *  resource=true,
     *  description="Get all votes of an opinion",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     * @Get("/opinions/{id}/votes")
     * @ParamConverter("opinion", options={
     *  "mapping": {"id": "id"},
     *  "repository_method": "getOne",
     *  "map_method_signature" = true
     * })
     * @QueryParam(name="limit", requirements="[0-9.]+", default="100")
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @Cache(smaxage="60", public=true)
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
     */
    public function getVotesAction(Opinion $opinion, ParamFetcherInterface $paramFetcher)
    {
        $limit = $paramFetcher->get('limit');
        $offset = $paramFetcher->get('offset');

        $repo = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionVote');

        $votes = $repo->getByOpinion($opinion->getId(), false, $limit, $offset);
        $count = $repo->getVotesCountByOpinion($opinion);

        return [
            'votes' => $votes,
            'count' => $count,
            'hasMore' => $count > $offset + $limit,
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
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
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
        $previousVote = $this->getDoctrine()
                    ->getRepository('CapcoAppBundle:OpinionVote')
                    ->findOneBy(['user' => $user, 'opinion' => $opinion]);

        if ($previousVote) {
            $opinion->incrementVotesCountByType($vote->getValue());
            $opinion->decrementVotesCountByType($previousVote->getValue());

            $previousVote->setValue($vote->getValue());
            $this->getDoctrine()->getManager()->flush();

            return $previousVote;
        }

        $vote
            ->setOpinion($opinion)
            ->setUser($user)
        ;

        $opinion->incrementVotesCountByType($vote->getValue());

        try {
            $this->getDoctrine()->getManager()->persist($vote);
            $this->getDoctrine()->getManager()->flush();
        } catch (DriverException $e) {
            // Updating opinion votes count failed
            throw new BadRequestHttpException('Sorry, please retry.');
        }

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
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos", "UserMedias"})
     */
    public function deleteOpinionVoteAction(Opinion $opinion)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException('Uncontribuable opinion.');
        }

        $vote = $this->getDoctrine()->getManager()
                     ->getRepository('CapcoAppBundle:OpinionVote')
                     ->findOneBy(['user' => $this->getUser(), 'opinion' => $opinion]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this opinion.');
        }

        $opinion->decrementVotesCountByType($vote->getValue());
        $this->getDoctrine()->getManager()->remove($vote);
        $this->getDoctrine()->getManager()->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        return $vote;
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
     * @QueryParam(name="filter", requirements="(old|last|votes|favorable|comments|random)", default="last")
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
            'versions' => $versions,
            'rankingThreshold' => $project->getVersionsRankingThreshold(),
            'opinionTerm' => $project->getOpinionTerm(),
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

        $votes = $this->getDoctrine()->getManager()
            ->getRepository('CapcoAppBundle:OpinionVersion')
            ->getWithVotes($version->getId(), 5);

        if (is_object($votes)) {
            $version->setVotes($votes->getVotes());
        }

        return [
            'version' => $version,
            'rankingThreshold' => $project->getVersionsRankingThreshold(),
            'opinionTerm' => $project->getOpinionTerm(),
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
            $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

            return $opinionVersion;
        }

        $view = $this->view($form->getErrors(true), Response::HTTP_BAD_REQUEST);

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
            $this->getDoctrine()->getManager()->persist($opinionVersion);
            $this->getDoctrine()->getManager()->flush();

            return $opinionVersion;
        }

        return $this->view($form->getErrors(true), Response::HTTP_BAD_REQUEST);
    }

    /**
     * Delete an opinion version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete an opinion version",
     *  statusCodes={
     *    204 = "Returned when successful",
     *    403 = "Returned when requesting user is not the version's author",
     *    400 = "Returned when delete fail",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}/versions/{versionId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("opinionVersion", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=204, serializerGroups={})
     */
    public function deleteOpinionVersionAction(Request $request, Opinion $opinion, OpinionVersion $opinionVersion)
    {
        $user = $this->getUser();
        if ($user !== $opinionVersion->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($opinionVersion);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
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
     * @View(serializerGroups={"Opinions", "UsersInfos", "Categories"})
     */
    public function cgetOpinionSourcesAction(Opinion $opinion, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');
        $trashed = false;

        $em = $this->getDoctrine()->getManager();
        $paginator = $em->getRepository('CapcoAppBundle:Source')
                        ->getByOpinion($opinion, $offset, $limit, $filter, $trashed);

        $sources = [];
        foreach ($paginator as $source) {
            $sources[] = $source;
        }

        return [
            'sources' => $sources,
            'count' => count($paginator),
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
     * @View(serializerGroups={"Opinions", "UsersInfos", "Categories"})
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
            'count' => count($paginator),
        ];
    }

    /**
     * Get all votes of a version.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all votes of a version",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when version is not found",
     *  }
     * )
     *
     * @Get("/opinions/{opinionId}/versions/{versionId}/votes")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @QueryParam(name="limit", requirements="[0-9.]+", default="100")
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @Cache(smaxage="60", public=true)
     * @View(statusCode=200, serializerGroups={"OpinionVersions", "UsersInfos", "UserMedias"})
     */
    public function getVersionVotesAction(Opinion $opinion, OpinionVersion $version, ParamFetcherInterface $paramFetcher)
    {
        $limit = $paramFetcher->get('limit');
        $offset = $paramFetcher->get('offset');

        $repo = $this->getDoctrine()->getManager()
            ->getRepository('CapcoAppBundle:OpinionVersionVote');

        $votes = $repo->getByVersion($version->getId(), false, $limit, $offset);
        $count = $repo->getVotesCountByVersion($version);

        return [
            'votes' => $votes,
            'count' => $count,
            'hasMore' => $count > $offset + $limit,
        ];
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
     * @View(statusCode=200, serializerGroups={"OpinionVersions", "UsersInfos", "UserMedias"})
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
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion or opinion version not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}/versions/{versionId}/votes")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=200, serializerGroups={"OpinionVersions", "UsersInfos", "UserMedias"})
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
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        return $vote;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/reports")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionReportAction(Request $request, Opinion $opinion)
    {
        if ($this->getUser() === $opinion->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        $report = (new Reporting())
            ->setReporter($this->getUser())
            ->setOpinion($opinion)
        ;

        $form = $this->createForm(new ReportingType(), $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()->getManager()->persist($report);
        $this->getDoctrine()->getManager()->flush();
        $this->get('capco.notify_manager')->sendNotifyMessage($report);

        return $report;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/versions/{versionId}/reports")
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionReportAction(Request $request, OpinionVersion $version)
    {
        if ($this->getUser() === $version->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        $report = (new Reporting())
            ->setReporter($this->getUser())
            ->setOpinionVersion($version)
        ;

        $form = $this->createForm(new ReportingType(), $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $this->getDoctrine()->getManager()->persist($report);
        $this->getDoctrine()->getManager()->flush();
        $this->get('capco.notify_manager')->sendNotifyMessage($report);

        return $report;
    }
}
