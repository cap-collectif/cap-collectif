<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\CapcoAppBundleMessagesTypes;
use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\ArgumentVote;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionVersion;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Form\ArgumentType;
use Capco\AppBundle\Form\ReportingType;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\Put;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Swarrot\Broker\Message;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Validator\ConstraintViolationListInterface;

class ArgumentsController extends FOSRestController
{
    /**
     * Get all arguments of an opinion version for specified type.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get all arguments of an opinion version for specified type",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion version not found",
     *  }
     * )
     *
     * @Get("opinions/{opinionId}/versions/{versionId}/arguments")
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @QueryParam(name="type", requirements="(0|1)", nullable=true)
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(statusCode=200, serializerGroups={"Opinions", "UsersInfos"})
     */
    public function cgetOpinionVersionArgumentsAction(Opinion $opinion, OpinionVersion $version, ParamFetcherInterface $paramFetcher)
    {
        $type = $paramFetcher->get('type');
        $filter = $paramFetcher->get('filter');

        if ($version->getParent() !== $opinion) {
            throw new BadRequestHttpException('Not a child');
        }

        $arguments = $this->get('capco.argument.repository')
            ->getByTypeAndOpinionVersionOrderedJoinUserReports($version, $type, $filter, $this->getUser());

        return [
            'arguments' => $arguments,
            'count' => \count($arguments),
        ];
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
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionArgumentAction(Request $request, Opinion $opinion)
    {
        if (!$opinion->canContribute()) {
            throw new BadRequestHttpException("Can't add an argument to an uncontributable opinion.");
        }

        if (0 === $opinion->getOpinionType()->getCommentSystem()) {
            throw new BadRequestHttpException("Can't add argument to this opinion type.");
        }

        $author = $this->getUser();
        $repo = $this->get('capco.argument.repository');

        if (\count($repo->findCreatedSinceIntervalByAuthor($author, 'PT1M')) >= 2) {
            throw new BadRequestHttpException('You contributed too many times.');
        }

        $argument = (new Argument())
            ->setOpinion($opinion)
            ->setAuthor($author)
            ->setUpdatedAt(new \Datetime())
        ;

        $form = $this->createForm(ArgumentType::class, $argument);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $opinion->increaseArgumentsCount();

        $em = $this->getDoctrine()->getManager();
        $em->persist($argument);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        $this->get('swarrot.publisher')->publish(CapcoAppBundleMessagesTypes::ARGUMENT_CREATE, new Message(
            json_encode([
                'argumentId' => $argument->getId(),
            ])
        ));

        return $argument;
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
     * @View(statusCode=201, serializerGroups={})
     */
    public function postOpinionVersionArgumentAction(Request $request, Opinion $opinion, OpinionVersion $version)
    {
        if ($opinion !== $version->getParent()) {
            throw new BadRequestHttpException('Not a child.');
        }

        if (!$version->canContribute()) {
            throw new BadRequestHttpException("Can't add an argument to an uncontributable opinion.");
        }

        if (0 === $opinion->getOpinionType()->getCommentSystem()) {
            throw new BadRequestHttpException("Can't add argument to this opinion type.");
        }

        $argument = (new Argument())
            ->setOpinionVersion($version)
            ->setAuthor($this->getUser())
            ->setUpdatedAt(new \Datetime())
        ;

        $form = $this->createForm(ArgumentType::class, $argument);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $version->increaseArgumentsCount();

        $em = $this->getDoctrine()->getManager();
        $em->persist($argument);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        $this->get('swarrot.publisher')->publish(CapcoAppBundleMessagesTypes::ARGUMENT_CREATE, new Message(
            json_encode([
                'argumentId' => $argument->getId(),
            ])
        ));

        return $argument;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Put("/opinions/{opinionId}/arguments/{argumentId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @View(statusCode=200, serializerGroups={})
     */
    public function putOpinionArgumentAction(Request $request, Opinion $opinion, Argument $argument)
    {
        if ($this->getUser() !== $argument->getAuthor()) {
            throw new AccessDeniedHttpException();
        }

        if ($argument->getOpinion() !== $opinion) {
            throw new BadRequestHttpException('Not a child.');
        }

        if (!$argument->canContribute()) {
            throw new BadRequestHttpException('Uncontributable argument');
        }

        $form = $this->createForm(ArgumentType::class, $argument);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $argument->setValidated(false);
        $argument->resetVotes();

        $em = $this->getDoctrine()->getManager();
        $em->persist($argument);
        $em->flush();

        $this->get('swarrot.publisher')->publish(CapcoAppBundleMessagesTypes::ARGUMENT_UPDATE, new Message(
            json_encode([
                'argumentId' => $argument->getId(),
            ])
        ));

        return $argument;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Put("/opinions/{opinionId}/versions/{versionId}/arguments/{argumentId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @View(statusCode=200, serializerGroups={})
     */
    public function putOpinionVersionArgumentAction(Request $request, Opinion $opinion, OpinionVersion $version, Argument $argument)
    {
        if ($this->getUser() !== $argument->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($argument->getOpinionVersion() !== $version) {
            throw new BadRequestHttpException('Not a child.');
        }

        if ($opinion !== $version->getParent()) {
            throw new BadRequestHttpException('Not a child.');
        }

        if (!$argument->canContribute()) {
            throw new BadRequestHttpException('Uncontributable argument');
        }

        $form = $this->createForm(ArgumentType::class, $argument);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $argument->setValidated(false);
        $argument->resetVotes();

        $em = $this->getDoctrine()->getManager();
        $em->persist($argument);
        $em->flush();

        $this->get('swarrot.publisher')->publish(CapcoAppBundleMessagesTypes::ARGUMENT_UPDATE, new Message(
            json_encode([
                'argumentId' => $argument->getId(),
            ])
        ));

        return $argument;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}/arguments/{argumentId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @View()
     */
    public function deleteOpinionArgumentAction(Opinion $opinion, Argument $argument)
    {
        if ($this->getUser() !== $argument->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($argument->getOpinion() !== $opinion) {
            throw new BadRequestHttpException('Not a child.');
        }

        if (!$argument->canBeDeleted()) {
            throw new BadRequestHttpException('Uncontributable argument.');
        }

        $opinion->decreaseArgumentsCount();
        $em = $this->getDoctrine()->getManager();
        $em->remove($argument);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/opinions/{opinionId}/versions/{versionId}/arguments/{argumentId}")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @View()
     */
    public function deleteOpinionVersionArgumentAction(Opinion $opinion, OpinionVersion $version, Argument $argument)
    {
        if ($this->getUser() !== $argument->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($argument->getOpinionVersion() !== $version) {
            throw new BadRequestHttpException('Not a child.');
        }

        if ($opinion !== $version->getParent()) {
            throw new BadRequestHttpException('Not a child.');
        }

        if (!$argument->canContribute()) {
            throw new BadRequestHttpException('Uncontributable argument.');
        }

        $version->decreaseArgumentsCount();

        $em = $this->getDoctrine()->getManager();
        $em->remove($argument);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/arguments/{argumentId}/votes")
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @ParamConverter("vote", converter="fos_rest.request_body")
     * @View(statusCode=201, serializerGroups={})
     */
    public function postArgumentVoteAction(Argument $argument, ArgumentVote $vote, ConstraintViolationListInterface $validationErrors)
    {
        if (!$argument->canContribute()) {
            throw new BadRequestHttpException('Uncontributable argument.');
        }

        $user = $this->getUser();
        $previousVote = $this->get('capco.argument_vote.repository')
                    ->findOneBy(['user' => $user, 'argument' => $argument]);

        if ($previousVote) {
            throw new BadRequestHttpException('Already voted.');
        }

        if ($validationErrors->count() > 0) {
            throw new BadRequestHttpException($validationErrors);
        }

        $vote
            ->setArgument($argument)
            ->setUser($user)
        ;

        $argument->incrementVotesCount();
        $em = $this->getDoctrine()->getManager();
        $em->persist($vote);
        $em->persist($argument);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/arguments/{argumentId}/votes")
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @View()
     */
    public function deleteArgumentVoteAction(Argument $argument)
    {
        if (!$argument->getLinkedOpinion()->canContribute()) {
            throw new BadRequestHttpException('Uncontributable opinion.');
        }
        $vote = $this->get('capco.argument_vote.repository')
                     ->findOneBy(['user' => $this->getUser(), 'argument' => $argument]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this argument.');
        }

        $argument->decrementVotesCount();
        $em = $this->getDoctrine()->getManager();
        $em->remove($vote);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/arguments/{argumentId}/reports")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionArgumentReportAction(Request $request, Opinion $opinion, Argument $argument)
    {
        if ($this->getUser() === $argument->getAuthor()) {
            throw new AccessDeniedHttpException();
        }

        if ($argument->getOpinion() !== $opinion) {
            throw new BadRequestHttpException('Not a child.');
        }

        return $this->createReport($request, $argument);
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/opinions/{opinionId}/versions/{versionId}/arguments/{argumentId}/reports")
     * @ParamConverter("opinion", options={"mapping": {"opinionId": "id"}})
     * @ParamConverter("version", options={"mapping": {"versionId": "id"}})
     * @ParamConverter("argument", options={"mapping": {"argumentId": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postOpinionVersionArgumentReportAction(Request $request, Opinion $opinion, OpinionVersion $version, Argument $argument)
    {
        if ($this->getUser() === $argument->getAuthor()) {
            throw new AccessDeniedHttpException();
        }

        if ($argument->getOpinionVersion() !== $version) {
            throw new BadRequestHttpException('Not a child.');
        }

        if ($opinion !== $version->getParent()) {
            throw new BadRequestHttpException('Not a child.');
        }

        return $this->createReport($request, $argument);
    }

    private function createReport(Request $request, Argument $argument)
    {
        $report = (new Reporting())
            ->setReporter($this->getUser())
            ->setArgument($argument)
        ;

        $form = $this->createForm(ReportingType::class, $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($report);
        $em->flush();
        $this->get('capco.report_notifier')->onCreate($report);

        return $report;
    }
}
