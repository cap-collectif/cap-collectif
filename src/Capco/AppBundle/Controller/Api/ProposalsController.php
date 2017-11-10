<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\Proposal;
use Capco\AppBundle\Entity\ProposalCollectVote;
use Capco\AppBundle\Entity\ProposalComment;
use Capco\AppBundle\Entity\ProposalForm;
use Capco\AppBundle\Entity\ProposalSelectionVote;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Entity\Status;
use Capco\AppBundle\Entity\Steps\AbstractStep;
use Capco\AppBundle\Entity\Steps\CollectStep;
use Capco\AppBundle\Entity\Steps\SelectionStep;
use Capco\AppBundle\Event\CommentChangedEvent;
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\Form\ProposalFusionType;
use Capco\AppBundle\Form\ProposalType;
use Capco\AppBundle\Form\ReportingType;
use Capco\AppBundle\Helper\ArrayHelper;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Patch;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Swarrot\Broker\Message;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class ProposalsController extends FOSRestController
{
    /**
     * Get a proposal.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get a proposal",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when opinion is not found",
     *  }
     * )
     *
     * @Get("/proposal_forms/{proposal_form_id}/proposals/{proposal_id}")
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200, serializerGroups={"Proposals", "ProposalFusions", "UsersInfos", "UserMedias", "ThemeDetails", "ProposalUserData", "Steps"})
     */
    public function getProposalAction(Proposal $proposal)
    {
        return [
            'proposal' => $proposal,
        ];
    }

    /**
     * @Get("/proposals/{proposalId}/selections")
     * @ParamConverter("proposal", options={"mapping": {"proposalId": "id"}})
     * @View(serializerGroups={"Statuses", "SelectionStepId"})
     */
    public function getProposalSelectionsAction(Proposal $proposal)
    {
        return $proposal->getSelections();
    }

    /**
     * Add a proposal.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post a proposal",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    401 = "Proposal does not exist",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/proposal_forms/{proposal_form_id}/proposals")
     * @ParamConverter("proposalForm", options={"mapping": {"proposal_form_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @View(statusCode=201, serializerGroups={"ProposalForms", "Proposals", "UsersInfos", "UserMedias"})
     */
    public function postProposalAction(Request $request, ProposalForm $proposalForm)
    {
        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();

        if (!$proposalForm->canContribute() && !$user->isAdmin()) {
            throw new BadRequestHttpException('You can no longer contribute to this collect step.');
        }

        $proposal = (new Proposal())
            ->setAuthor($user)
            ->setProposalForm($proposalForm)
            ->setEnabled(true)
        ;

        if ($proposalForm->getStep() && $defaultStatus = $proposalForm->getStep()->getDefaultStatus()) {
            $proposal->setStatus($defaultStatus);
        }

        $formClass = $user->isAdmin() ? ProposalFusionType::class : ProposalType::class;

        $form = $this->createForm($formClass, $proposal, [
            'proposalForm' => $proposalForm,
        ]);

        if ($uploadedMedia = $request->files->get('media')) {
            $media = $this->get('capco.media.manager')->createFileFromUploadedFile($uploadedMedia);
            $proposal->setMedia($media);
            $request->files->remove('media');
        }

        $request->files->remove('media');
        $request->request->remove('media');
        $request->request->remove('delete_media');

        $unflattenRequest = ArrayHelper::unflatten($request->request->all());
        $unflattenFile = ArrayHelper::unflatten($request->files->all());

        if (isset($unflattenRequest['responses']) && is_array($unflattenRequest['responses'])) {
            $unflattenRequest = $this->get('capco.media.response.media.manager')
                ->resolveTypeOfResponses($unflattenRequest, $unflattenFile);
        }

        unset($unflattenRequest['delete_media'], $unflattenRequest['media']);

        $form->submit($unflattenRequest, false);

        if (!$form->isValid()) {
            return $form;
        }

        $em->persist($proposal);
        $em->flush();

        if (count($request->files->all()) > 0) {
            $this->get('capco.media.response.media.manager')->updateMediasFromRequest($proposal, $request);
            $em->persist($proposal);
            $em->flush();
        }
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        // If not present, es listener will take some time to execute the refresh
        // and, next time proposals will be fetched, the set of data will be outdated.
        // Keep in mind that refresh should usually not be triggered manually.
        $index = $this->get('fos_elastica.index');
        $index->refresh();

        if ($proposalForm->isNotifyingOnCreate()) {
            $this->get('swarrot.publisher')->publish('proposal.create', new Message(
              json_encode([
                'proposalId' => $proposal->getId(),
              ])
            ));
        }

        return $proposal;
    }

    /**
     * @Get("/proposal_forms/{form}/proposals/{proposal}/comments")
     * @ParamConverter("form", options={"mapping": {"form": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal": "id"}})
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
     * @View(serializerGroups={"Comments", "UsersInfos"})
     */
    public function getProposalCommentsAction(ProposalForm $form, Proposal $proposal, ParamFetcherInterface $paramFetcher)
    {
        $offset = $paramFetcher->get('offset');
        $limit = $paramFetcher->get('limit');
        $filter = $paramFetcher->get('filter');

        $paginator = $this->getDoctrine()->getManager()
                    ->getRepository('CapcoAppBundle:ProposalComment')
                    ->getEnabledByProposal($proposal, $offset, $limit, $filter);

        $comments = [];
        foreach ($paginator as $comment) {
            $comments[] = $comment;
        }

        $countWithAnswers = $this->getDoctrine()->getManager()
                      ->getRepository('CapcoAppBundle:ProposalComment')
                      ->countCommentsAndAnswersEnabledByProposal($proposal);

        return [
            'comments_and_answers_count' => (int) $countWithAnswers,
            'comments_count' => count($paginator),
            'comments' => $comments,
        ];
    }

    /**
     * @Post("/proposal_forms/{form}/proposals/{proposal}/comments")
     * @ParamConverter("form", options={"mapping": {"form": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal": "id"}})
     * @View(statusCode=201, serializerGroups={"Comments", "UsersInfos"})
     */
    public function postProposalCommentsAction(Request $request, ProposalForm $form, Proposal $proposal)
    {
        if (!$proposal->canComment()) {
            throw new BadRequestHttpException('You can not comment this proposal.');
        }

        $user = $this->getUser();

        $comment = (new ProposalComment())
            ->setAuthorIp($request->getClientIp())
            ->setAuthor($user)
            ->setProposal($proposal)
            ->setIsEnabled(true)
        ;

        $form = $this->createForm(new CommentType($user), $comment);
        $form->handleRequest($request);

        if (!$form->isValid()) {
            return $form;
        }

        $parent = $comment->getParent();

        if ($parent) {
            if (!$parent instanceof ProposalComment || $proposal !== $parent->getProposal()) {
                throw $this->createNotFoundException('This parent comment is not linked to this proposal');
            }

            if ($parent->getParent()) {
                throw new BadRequestHttpException('You can\'t answer the answer of a comment.');
            }
        }

        $proposal->setCommentsCount($proposal->getCommentsCount() + 1);
        $em = $this->getDoctrine()->getManager();
        $em->persist($comment);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
        $this->get('event_dispatcher')->dispatch(
            CapcoAppBundleEvents::COMMENT_CHANGED,
            new CommentChangedEvent($comment, 'add')
        );
    }

    /**
     * @Get("/steps/{step}/proposals/{proposal}/votes")
     * @ParamConverter("step", options={"mapping": {"step": "id"}})
     * @ParamConverter("proposal", options={"mapping": {"proposal": "id"}})
     * @View(serializerGroups={"ProposalSelectionVotes", "UsersInfos", "UserMedias", "ProposalCollectVotes"})
     */
    public function getAllProposalVotesAction(AbstractStep $step, Proposal $proposal)
    {
        switch (true) {
            case $step instanceof CollectStep:
                $votes = $this->getDoctrine()->getRepository(ProposalCollectVote::class)->getVotesForProposalByStepId($proposal, $step->getId());
                break;
            case $step instanceof SelectionStep:
                $votes = $this->getDoctrine()->getRepository(ProposalSelectionVote::class)->getVotesForProposalByStepId($proposal, $step->getId());
                break;
            default:
                throw new NotFoundHttpException();
        }

        return [
            'votes' => $votes,
            'count' => count($votes),
        ];
    }

    /**
     * @Get("/proposals/{proposal}/posts")
     * @ParamConverter("proposal", options={"mapping": {"proposal": "id"}})
     * @View(serializerGroups={"Posts", "PostDetails", "UsersInfos", "UserMedias", "Themes"})
     * @Cache(smaxage="60", public=true)
     */
    public function getProposalPostsAction(Proposal $proposal)
    {
        $posts = $this
            ->getDoctrine()->getManager()
            ->getRepository('CapcoAppBundle:Post')
            ->getPublishedPostsByProposal($proposal)
        ;

        return [
            'posts' => $posts,
        ];
    }

    /**
     * @Patch("/proposals/{proposal}")
     * @ParamConverter("proposal", options={"mapping": {"proposal": "id"}})
     * @Security("has_role('ROLE_ADMIN')")
     * @View(statusCode=200, serializerGroups={"Statuses"})
     */
    public function patchProposalAction(Request $request, Proposal $proposal)
    {
        $em = $this->getDoctrine()->getManager();
        $status = null;

        if ($request->request->get('status')) {
            $status = $em->getRepository('CapcoAppBundle:Status')->find($request->request->get('status'));
        }

        $proposal->setStatus($status);
        $em->flush();

        return $status;
    }

    /**
     * Update a proposal.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Update a proposal",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when proposal is not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/proposal_forms/{proposal_form_id}/proposals/{proposal_id}")
     * @ParamConverter("proposalForm", options={"mapping": {"proposal_form_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=200)
     */
    public function putProposalAction(Request $request, ProposalForm $proposalForm, Proposal $proposal)
    {
        $user = $this->getUser();
        if (!$proposal->canContribute()) {
            throw new BadRequestHttpException('This proposal is no longer editable.');
        }

        if ($this->getUser() !== $proposal->getAuthor()) {
            throw new AccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();

        $form = $this->createForm(ProposalType::class, $proposal, [
            'proposalForm' => $proposalForm,
        ]);

        if ('false' === $request->request->get('media')) {
            if ($proposal->getMedia()) {
                $em->remove($proposal->getMedia());
                $proposal->setMedia(null);
            }
            $request->files->remove('delete_media');
        } elseif ($uploadedMedia = $request->files->get('media')) {
            if ($proposal->getMedia()) {
                $em->remove($proposal->getMedia());
            }
            $media = $this->get('capco.media.manager')->createFileFromUploadedFile($uploadedMedia);
            $proposal->setMedia($media);
        }

        $request->files->remove('media');
        $request->request->remove('media');
        $request->request->remove('delete_media');

        $unflattenRequest = ArrayHelper::unflatten($request->request->all());

        if (count($request->files->all()) > 0) {
            $request = $this->get('capco.media.response.media.manager')->updateMediasFromRequest($proposal, $request);
        }

        if (isset($unflattenRequest['responses'])) {
            $unflattenRequest = $this->get('capco.media.response.media.manager')
                ->resolveTypeOfResponses($unflattenRequest, ArrayHelper::unflatten($request->files->all()));
        }

        $form->submit($unflattenRequest, false);

        if ($form->isValid()) {
            $proposal->setUpdateAuthor($user);

            $em->persist($proposal);
            $em->flush();

            if (
                $proposalForm->getNotificationsConfiguration()
                && $proposalForm->getNotificationsConfiguration()->isOnUpdate()
            ) {
                $this->get('swarrot.publisher')->publish('proposal.update', new Message(
                  json_encode([
                    'proposalId' => $proposal->getId(),
                  ])
                ));
            }

            return $proposal;
        }

        return $this->view($form->getErrors(true), Response::HTTP_BAD_REQUEST);
    }

    /**
     * Delete a proposal.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Delete a proposal",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Returned when proposal is not found",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Delete("/proposal_forms/{proposal_form_id}/proposals/{proposal_id}")
     * @ParamConverter("proposalForm", options={"mapping": {"proposal_form_id": "id"}, "repository_method": "getOne", "map_method_signature": true})
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=204)
     */
    public function deleteProposalAction(ProposalForm $proposalForm, Proposal $proposal)
    {
        if ($this->getUser() !== $proposal->getAuthor()) {
            throw new BadRequestHttpException('You are not the author of this proposal');
        }

        if (!$proposal) {
            throw $this->createNotFoundException('Proposal not found');
        }

        $em = $this->getDoctrine()->getManager();

        $em->remove($proposal);
        $em->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        if (
            $proposalForm->getNotificationsConfiguration()
            && $proposalForm->getNotificationsConfiguration()->isOnDelete()
        ) {
            $this->get('swarrot.publisher')->publish('proposal.delete', new Message(
              json_encode([
                'proposalId' => $proposal->getId(),
              ])
            ));
        }

        // If not present, es listener will take some time to execute the refresh
        // and, next time proposals will be fetched, the set of data will be outdated.
        // Keep in mind that refresh should usually not be triggered manually.
        $index = $this->get('fos_elastica.index');
        $index->refresh();

        return [];
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/proposals/{proposal_id}/reports")
     * @ParamConverter("proposal", options={"mapping": {"proposal_id": "id"}, "repository_method": "find", "map_method_signature": true})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postProposalReportAction(Request $request, Proposal $proposal)
    {
        if ($this->getUser() === $proposal->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        $report = (new Reporting())
            ->setReporter($this->getUser())
            ->setProposal($proposal)
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
