<?php

namespace Capco\AppBundle\Controller\Api;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\IdeaComment;
use Capco\AppBundle\Entity\IdeaVote;
use Capco\AppBundle\Entity\Reporting;
use Capco\AppBundle\Event\CommentChangedEvent;
use Capco\AppBundle\Form\CommentType;
use Capco\AppBundle\Form\IdeaType;
use Capco\AppBundle\Form\IdeaVoteType;
use Capco\AppBundle\Form\ReportingType;
use FOS\RestBundle\Controller\Annotations\Delete;
use FOS\RestBundle\Controller\Annotations\Get;
use FOS\RestBundle\Controller\Annotations\Post;
use FOS\RestBundle\Controller\Annotations\QueryParam;
use FOS\RestBundle\Controller\Annotations\View;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Request\ParamFetcherInterface;
use Nelmio\ApiDocBundle\Annotation\ApiDoc;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class IdeasController extends FOSRestController
{
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
     * @Post("/ideas/search", defaults={"_feature_flags" = "ideas"})
     * @QueryParam(name="pagination", nullable=true)
     * @QueryParam(name="page", default="1")
     * @QueryParam(name="from", nullable=true)
     * @QueryParam(name="to", nullable=true)
     * @QueryParam(name="order", requirements="(old|last|comments|popular)", default="last")
     * @View(statusCode=200, serializerGroups={"Ideas", "ThemeDetails", "UsersInfos"})
     */
    public function getIdeasAction(Request $request, ParamFetcherInterface $paramFetcher)
    {
        $pagination = (int) $paramFetcher->get('pagination');
        if (null === $pagination) {
            $pagination = $this->get('capco.site_parameter.resolver')->getValue('ideas.pagination');
        }
        $page = (int) $paramFetcher->get('page');
        $from = $paramFetcher->get('from');
        $to = $paramFetcher->get('to');
        $order = $paramFetcher->get('order');

        $terms = $request->request->has('terms') ? $request->request->get('terms') : null;
        $theme = $request->request->has('theme') ? $request->request->get('theme') : null;

        $repo = $this
            ->getDoctrine()
            ->getRepository('CapcoAppBundle:Idea')
        ;

        $ideas = $repo->getSearchResults($pagination, $page, $from, $to, $theme, $order, $terms);
        $count = $repo->countSearchResults($from, $to, $theme, $terms);
        $countTrashed = $repo->countTrashed();

        return [
            'ideas' => $ideas,
            'count' => $count,
            'countTrashed' => $countTrashed,
        ];
    }

    /**
     * Get idea.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get idea",
     *  statusCodes={
     *    200 = "Returned when successful",
     *  }
     * )
     *
     * @Get("/ideas/{id}", defaults={"_feature_flags" = "ideas"}))
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @View(statusCode=200, serializerGroups={"Ideas", "ThemeDetails", "UsersInfos"})
     */
    public function getIdeaAction(Idea $idea)
    {
        return [
            'idea' => $idea,
        ];
    }

    /**
     * @Get("/ideas/{id}/votes")
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @QueryParam(name="limit", requirements="[0-9.]+", default="10")
     * @QueryParam(name="offset", requirements="[0-9.]+", default="0")
     * @View(serializerGroups={"IdeaVotes", "UsersInfos", "UserMedias"})
     */
    public function getIdeaVotesAction(Idea $idea, ParamFetcherInterface $paramFetcher)
    {
        $limit = $paramFetcher->get('limit');
        $offset = $paramFetcher->get('offset');

        $votes = $this
            ->getDoctrine()
            ->getRepository('CapcoAppBundle:IdeaVote')
            ->getVotesForIdea($idea, $limit, $offset)
        ;

        $count = $this
            ->getDoctrine()
            ->getRepository('CapcoAppBundle:IdeaVote')
            ->getVotesCountForIdea($idea)
        ;

        return [
            'votes' => $votes,
            'count' => $count,
            'hasMore' => $count > $offset + $limit,
        ];
    }

    /**
     * Post an idea.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post an idea.",
     *  statusCodes={
     *    201 = "Returned when successful",
     *  }
     * )
     *
     * @Security("has_role('ROLE_USER')")
     * @Post("/ideas", defaults={"_feature_flags" = "ideas,idea_creation"})
     * @View(statusCode=201, serializerGroups={})
     */
    public function postIdeaAction(Request $request)
    {
        $idea = (new Idea())
            ->setAuthor($this->getUser())
            ->setUpdatedAt(new \Datetime())
        ;

        if (($uploadedMedia = $request->files->get('media')) && (!$deleteMedia = $request->request->get('delete_media'))) {
            $mediaManager = $this->get('capco.media.manager');
            $media = $mediaManager->createFileFromUploadedFile($uploadedMedia);
            $idea->setMedia($media);
        }

        $form = $this->createForm(IdeaType::class, $idea);
        $form->submit($request->request->all());

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($idea);
        $em->flush();

        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        return $idea;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/ideas/{id}", defaults={"_feature_flags" = "ideas"})
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @View(statusCode=200, serializerGroups={})
     */
    public function updateIdeaAction(Request $request, Idea $idea)
    {
        $em = $this->getDoctrine()->getManager();

        if ($this->getUser() !== $idea->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        if ($deleteMedia = $request->request->get('delete_media')) {
            if ($idea->getMedia()) {
                $em->remove($idea->getMedia());
                $idea->setMedia(null);
            }
        } elseif ($uploadedMedia = $request->files->get('media')) {
            if ($idea->getMedia()) {
                $em->remove($idea->getMedia());
            }
            $mediaManager = $this->get('sonata.media.manager.media');
            $media = $mediaManager->create();
            $media->setProviderName('sonata.media.provider.image');
            $media->setBinaryContent($uploadedMedia);
            $media->setContext('default');
            $media->setEnabled(true);
            $mediaManager->save($media, false);
            $idea->setMedia($media);
        }

        $form = $this->createForm(IdeaType::class, $idea);
        $form->submit($request->request->all());

        if (!$form->isValid()) {
            return $form;
        }

        $idea->setValidated(false);
        $idea->resetVotes();
        $em->flush();

        return $idea;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/ideas/{id}", defaults={"_feature_flags" = "ideas"})
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @View()
     */
    public function deleteIdeaAction(Idea $idea)
    {
        if ($this->getUser() !== $idea->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        $em = $this->getDoctrine()->getManager();
        $em->remove($idea);
        $em->flush();

        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());
    }

    /**
     * @Post("/ideas/{id}/votes", defaults={"_feature_flags" = "ideas"})
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @View(statusCode=201, serializerGroups={"IdeaVotes", "UsersInfos", "UserMedias"})
     */
    public function postIdeaVoteAction(Request $request, Idea $idea)
    {
        $user = $this->getUser();
        $em = $this->getDoctrine()->getManager();

        // Check if idea is votable
        if (!$idea->canContribute()) {
            throw new BadRequestHttpException('This idea is not contributable.');
        }

        $vote = (new IdeaVote())
            ->setIpAddress($request->getClientIp())
            ->setUser($user)
            ->setIdea($idea)
        ;

        $form = $this->createForm(IdeaVoteType::class, $vote, ['commentable' => $idea->getIsCommentable()]);
        $form->submit($request->request->all());

        if (!$form->isValid()) {
            $error = $form->getErrors(true, true)[0]->getMessage();
            throw new BadRequestHttpException($error);
        }

        $idea->incrementVotesCount();

        if ($request->request->has('comment') && null !== ($content = $form->get('comment')->getData())) {
            $comment = (new IdeaComment())
                ->setIdea($idea)
                ->setAuthor($vote->getUser())
                ->setAuthorName($vote->getUsername())
                ->setAuthorEmail($vote->getEmail())
                ->setBody($content);

            $em->persist($comment);
            $this->get('event_dispatcher')->dispatch(
                CapcoAppBundleEvents::COMMENT_CHANGED,
                new CommentChangedEvent($comment, 'add')
            );
        }

        $em->persist($vote);
        $em->flush();

        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        return $vote;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Delete("/ideas/{id}/votes", defaults={"_feature_flags" = "ideas"})
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @View(statusCode=200, serializerGroups={"IdeaVotes", "UsersInfos", "UserMedias"})
     */
    public function deleteIdeaVoteAction(Idea $idea)
    {
        $em = $this->getDoctrine()->getManager();

        $vote = $em
            ->getRepository('CapcoAppBundle:IdeaVote')
            ->findOneBy([
                'user' => $this->getUser(),
                'idea' => $idea,
            ]);

        if (!$vote) {
            throw new BadRequestHttpException('You have not voted for this idea.');
        }

        $idea->decrementVotesCount();

        $em->remove($vote);
        $em->flush();

        $this->get('redis_storage.helper')->recomputeUserCounters($this->getUser());

        return $vote;
    }

    /**
     * @Security("has_role('ROLE_USER')")
     * @Post("/ideas/{id}/reports", defaults={"_feature_flags" = "ideas"})
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @View(statusCode=201, serializerGroups={"Default"})
     */
    public function postIdeaReportAction(Request $request, Idea $idea)
    {
        if ($this->getUser() === $idea->getAuthor()) {
            throw $this->createAccessDeniedException();
        }

        $report = (new Reporting())
            ->setReporter($this->getUser())
            ->setIdea($idea)
        ;

        $form = $this->createForm(new ReportingType(), $report, ['csrf_protection' => false]);
        $form->submit($request->request->all(), false);

        if (!$form->isValid()) {
            return $form;
        }

        $em = $this->getDoctrine()->getManager();
        $em->persist($report);
        $em->flush();
        $this->get('capco.notify_manager')->sendNotifyMessage($report);

        return $report;
    }

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
     * @QueryParam(name="filter", requirements="(old|last|popular)", default="last")
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

        $countWithAnswers = $this->getDoctrine()->getManager()
            ->getRepository('CapcoAppBundle:IdeaComment')
            ->countCommentsAndAnswersEnabledByIdea($idea);

        return [
            'commentsAndAnswersCount' => (int) $countWithAnswers,
            'commentsCount' => count($paginator),
            'comments' => $comments,
        ];
    }

    /**
     * Add an idea comment.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Post an idea comments",
     *  statusCodes={
     *    201 = "Returned when successful",
     *    404 = "Idea does not exist",
     *  }
     * )
     *
     * @Post("/ideas/{id}/comments")
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @View(statusCode=201, serializerGroups={"Comments", "UsersInfos"})
     */
    public function postIdeaCommentsAction(Request $request, Idea $idea)
    {
        $user = $this->getUser();

        $comment = (new IdeaComment())
                    ->setAuthorIp($request->getClientIp())
                    ->setAuthor($user)
                    ->setIdea($idea)
                    ->setIsEnabled(true)
                ;

        $form = $this->createForm(new CommentType($user), $comment);
        $form->handleRequest($request);

        if (!$form->isValid()) {
            return $form;
        }

        $parent = $comment->getParent();
        if ($parent) {
            if (!$parent instanceof IdeaComment || $idea !== $parent->getIdea()) {
                throw $this->createNotFoundException('This parent comment is not linked to this idea');
            }
            if (null !== $parent->getParent()) {
                throw new BadRequestHttpException('You can\'t answer the answer of a comment.');
            }
        }

        $idea->setCommentsCount($idea->getCommentsCount() + 1);
        $this->getDoctrine()->getManager()->persist($comment);

        $this->get('event_dispatcher')->dispatch(
            CapcoAppBundleEvents::COMMENT_CHANGED,
            new CommentChangedEvent($comment, 'add')
        );

        $this->getDoctrine()->getManager()->flush();
        $this->get('redis_storage.helper')->recomputeUserCounters($user);
    }

    /**
     * Get idea voters.
     *
     * @ApiDoc(
     *  resource=true,
     *  description="Get idea voters",
     *  statusCodes={
     *    200 = "Returned when successful",
     *    404 = "Idea does not exist",
     *  }
     * )
     *
     * @Get("/ideas/{id}/voters")
     * @Security("has_role('ROLE_ADMIN')")
     * @ParamConverter("idea", options={"mapping": {"id": "id"}})
     * @View()
     */
    public function getIdeaVotersAction(Idea $idea, ParamFetcherInterface $paramFetcher)
    {
        $anonymousVoters = $this->getDoctrine()->getManager()
            ->getRepository('CapcoAppBundle:IdeaVote')
            ->getAnonymousVotersByIdea($idea);

        $memberVoters = $this->getDoctrine()->getManager()
            ->getRepository('CapcoAppBundle:IdeaVote')
            ->getMemberVotersByIdea($idea);

        $voters = [];

        foreach ($anonymousVoters as $v) {
            $v['isMember'] = false;
            $voters[] = $v;
        }
        foreach ($memberVoters as $v) {
            $v['isMember'] = true;
            $voters[] = $v;
        }

        return [
            'voters' => $voters,
        ];
    }
}
