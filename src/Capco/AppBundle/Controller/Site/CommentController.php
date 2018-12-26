<?php

namespace Capco\AppBundle\Controller\Site;

use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Entity\Comment;
use Capco\AppBundle\Event\CommentChangedEvent;
use Capco\AppBundle\Form\CommentType as CommentForm;
use Capco\AppBundle\GraphQL\Resolver\Comment\CommentShowUrlResolver;
use Capco\AppBundle\Manager\CommentResolver;
use Capco\UserBundle\Security\Exception\ProjectAccessDeniedException;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Security;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;

class CommentController extends Controller
{
    /**
     * @Route("/comments/{objectType}/{objectId}/login", name="app_comment_login")
     * @Security("has_role('ROLE_USER')")
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function loginToCommentAction($objectType, $objectId)
    {
        return $this->redirect(
            $this->get(CommentResolver::class)->getUrlOfObjectByTypeAndId($objectType, $objectId)
        );
    }

    /**
     * @Template("CapcoAppBundle:Comment:list.html.twig")
     *
     * @param $object
     *
     * @return array
     */
    public function showCommentsAction($object)
    {
        $comments = $this->get(CommentResolver::class)->getCommentsByObject($object);

        return ['comments' => $comments];
    }

    /**
     * @Route("/comments/{commentId}/edit", name="app_comment_edit")
     * @Template("CapcoAppBundle:Comment:update.html.twig")
     * @ParamConverter("comment", class="CapcoAppBundle:Comment", options={"mapping" = {"commentId": "id"}, "repository_method"= "find", "map_method_signature" = true})
     * @Security("has_role('ROLE_USER')")
     *
     * @throws ProjectAccessDeniedException
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function updateCommentAction(Request $request, Comment $comment)
    {
        if (false === $comment->canContribute($this->getUser())) {
            throw new ProjectAccessDeniedException(
                $this->get('translator')->trans('comment.error.no_contribute', [], 'CapcoAppBundle')
            );
        }

        $userCurrent = $this->getUser();
        $userPostComment = $comment->getAuthor();

        if ($userCurrent !== $userPostComment) {
            throw new ProjectAccessDeniedException(
                $this->get('translator')->trans('comment.error.not_author', [], 'CapcoAppBundle')
            );
        }

        $form = $this->createForm(CommentForm::class, $comment, ['actionType' => 'edit']);
        if ($request->isMethod('POST')) {
            $form->handleRequest($request);

            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $comment->resetVotes();
                $em->persist($comment);
                $em->flush();
                $this->get('event_dispatcher')->dispatch(
                    CapcoAppBundleEvents::COMMENT_CHANGED,
                    new CommentChangedEvent($comment, 'update')
                );

                $flashBag->add(
                    'success',
                    $this->get('translator')->trans('comment.update.success')
                );

                return $this->redirect(
                    $this->get(CommentResolver::class)->getUrlOfRelatedObject($comment)
                );
            }
            $flashBag->add('danger', $this->get('translator')->trans('comment.update.error'));
        }

        return ['form' => $form->createView(), 'comment' => $comment];
    }

    /**
     * @Route("/comments/{commentId}/delete", name="app_comment_delete")
     * @Template("CapcoAppBundle:Comment:delete.html.twig")
     * @Security("has_role('ROLE_USER')")
     *
     * @throws ProjectAccessDeniedException
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function deleteCommentAction(Request $request, Comment $comment)
    {
        if (false === $comment->canContribute($this->getUser())) {
            throw new ProjectAccessDeniedException(
                $this->get('translator')->trans('comment.error.no_contribute', [], 'CapcoAppBundle')
            );
        }

        $userCurrent = $this->getUser()->getId();
        $userPostComment = $comment->getAuthor()->getId();

        if ($userCurrent !== $userPostComment) {
            throw new ProjectAccessDeniedException(
                $this->get('translator')->trans('comment.error.not_author', [], 'CapcoAppBundle')
            );
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ('POST' === $request->getMethod()) {
            $form->handleRequest($request);

            // We create a session for flashBag
            $flashBag = $this->get('session')->getFlashBag();

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($comment);
                // TODO change it for sf 4.0
                $this->get('event_dispatcher')->dispatch(
                    CapcoAppBundleEvents::COMMENT_CHANGED,
                    new CommentChangedEvent($comment, 'remove')
                );
                $em->flush();

                $flashBag->add('info', $this->get('translator')->trans('comment.delete.success'));

                return $this->redirect(
                    $this->get(CommentResolver::class)->getUrlOfRelatedObject($comment)
                );
            }
            $flashBag->add('danger', $this->get('translator')->trans('comment.delete.error'));
        }

        return ['form' => $form->createView(), 'comment' => $comment];
    }

    /**
     * @Route("/admin/capco/app/comment/{commentId}/preview", name="capco_admin.admin.comment.preview")
     * @ParamConverter("comment", options={"mapping": {"commentId": "id"}})
     */
    public function previewAction(Request $request, Comment $comment): Response
    {
        $commentUrlResolver = $this->container->get(CommentShowUrlResolver::class);

        return new RedirectResponse($commentUrlResolver->__invoke($comment));
    }
}
