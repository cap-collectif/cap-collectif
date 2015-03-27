<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\AbstractComment;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Capco\AppBundle\Entity\CommentVote;
use Capco\AppBundle\Form\CommentType as CommentForm;
use Capco\AppBundle\CapcoAppBundleEvents;
use Capco\AppBundle\Event\AddContributionEvent;

class CommentController extends Controller
{
    /**
     * @Route("/comments/{objectType}/{objectId}/login", name="app_comment_login")
     *
     * @param $objectType
     * @param $objectId
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function loginToCommentAction($objectType, $objectId)
    {
        if (!$this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        return $this->redirect($this->get('capco.comment.resolver')->getUrlOfObjectByTypeAndId($objectType, $objectId));
    }

    /**
     * @Template("CapcoAppBundle:Comment:create.html.twig")
     * @Route("/secure/comments/{objectType}/{objectId}/add", name="app_comment_create")
     *
     * @param $objectId
     * @param $objectType
     * @param Request $request
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws AccessDeniedException
     * @throws NotFoundHttpException
     */
    public function createAction($objectType, $objectId, Request $request)
    {
        $object = $this->get('capco.comment.resolver')->getObjectByTypeAndId($objectType, $objectId);
        $user = $this->getUser();
        $ip = $request->getClientIp();

        $comment = $this->get('capco.comment.resolver')->createCommentForType($objectType);
        if (null != $user) {
            $comment->setAuthor($this->getUser());
        }
        if (null != $ip) {
            $comment->setAuthorIp($ip);
        }
        $comment->setIsEnabled(true);

        $comment = $this->get('capco.comment.resolver')->setObjectOnComment($object, $comment);

        $form = $this->createForm(new CommentForm($user), $comment);

        if ($request->getMethod() == 'POST') {
            if (false == $this->get('capco.comment.resolver')->canAddCommentOn($object)) {
                throw new AccessDeniedException($this->get('translator')->trans('consultation.error.no_contribute', array(), 'CapcoAppBundle'));
            }

            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($comment);
                $em->flush();

                $this->get('event_dispatcher')->dispatch(
                    CapcoAppBundleEvents::AFTER_CONTRIBUTION_ADDED,
                    new AddContributionEvent($this->getUser())
                );

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('comment.create.success'));

                return $this->redirect($this->get('capco.comment.resolver')->getUrlOfRelatedObject($comment));
            } else {
                foreach ($form->getErrors() as $error) {
                    $this->get('session')->getFlashBag()->add('danger', $error->getMessage());
                }
                foreach ($form->all() as $key => $child) {
                    foreach ($child->getErrors() as $error) {
                        $this->get('session')->getFlashBag()->add('danger', $error->getMessage());
                    }
                }

                return $this->redirect($this->get('capco.comment.resolver')->getUrlOfRelatedObject($comment));
            }
        }

        return [
            'object' => $object,
            'form' => $form->createView(),
        ];
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
        $comments = $this->get('capco.comment.resolver')->getCommentsByObject($object);

        return [
            'comments' => $comments,
        ];
    }

    /**
     * @Route("/secure/comments/{commentId}/vote", name="app_comment_vote")
     *
     * @param $commentId
     * @param Request $request
     *
     * @return \Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws AccessDeniedException
     */
    public function voteOnCommentAction($commentId, Request $request)
    {
        if (!$this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $comment = $this->getDoctrine()->getRepository('CapcoAppBundle:AbstractComment')->getOneById($commentId);

        if ($comment == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('comment.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $comment->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('comment.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $user = $this->getUser();

        if ($request->getMethod() == 'POST') {
            if ($this->isCsrfTokenValid('comment_vote', $request->get('_csrf_token'))) {
                $em = $this->getDoctrine()->getManager();

                $commentVote = new CommentVote();
                $commentVote->setUser($user);

                $userVote = $em->getRepository('CapcoAppBundle:CommentVote')->findOneBy(array(
                    'user' => $user,
                    'comment' => $comment,
                ));

                if ($userVote != null) {
                    $commentVote = $userVote;
                }

                if ($userVote == null) {
                    $commentVote->setComment($comment);
                    $em->persist($commentVote);
                    $em->flush();

                    $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('comment.vote.add_success'));
                } else {
                    $em->remove($commentVote);
                    $em->flush();

                    $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('comment.vote.remove_success'));
                }
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('comment.vote.csrf_error'));
            }
        }

        $url = $this->get('capco.comment.resolver')->getUrlOfRelatedObject($comment);

        return $this->redirect($url);
    }

    /**
     * @Route("/comments/{commentId}/edit", name="app_comment_edit")
     * @Template("CapcoAppBundle:Comment:update.html.twig")
     *
     * @param $commentId
     * @param Request $request
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws AccessDeniedException
     */
    public function updateCommentAction($commentId, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $comment = $this->getDoctrine()->getRepository('CapcoAppBundle:AbstractComment')->getOneById($commentId);

        if ($comment == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('comment.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $comment->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('comment.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $userCurrent = $this->getUser();
        $userPostComment = $comment->getAuthor();

        if ($userCurrent !== $userPostComment) {
            throw new AccessDeniedException($this->get('translator')->trans('comment.error.not_author', array(), 'CapcoAppBundle'));
        }

        $form = $this->createForm(new CommentForm($userCurrent), $comment);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $comment->resetVotes();
                $em->persist($comment);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('comment.update.success'));

                return $this->redirect($this->get('capco.comment.resolver')->getUrlOfRelatedObject($comment));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('comment.update.error'));
            }
        }

        return [
            'form' => $form->createView(),
            'comment' => $comment,
        ];
    }

    /**
     * @Route("/comments/{commentId}/delete", name="app_comment_delete")
     * @Template("CapcoAppBundle:Comment:delete.html.twig")
     *
     * @param $commentId
     * @param Request $request
     *
     * @return array|\Symfony\Component\HttpFoundation\RedirectResponse
     *
     * @throws AccessDeniedException
     */
    public function deleteCommentAction($commentId, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('error.access_restricted', array(), 'CapcoAppBundle'));
        }

        $comment = $this->getDoctrine()->getRepository('CapcoAppBundle:AbstractComment')->getOneById($commentId);

        if ($comment == null) {
            throw $this->createNotFoundException($this->get('translator')->trans('comment.error.not_found', array(), 'CapcoAppBundle'));
        }

        if (false == $comment->canContribute()) {
            throw new AccessDeniedException($this->get('translator')->trans('comment.error.no_contribute', array(), 'CapcoAppBundle'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostComment = $comment->getAuthor()->getId();

        if ($userCurrent !== $userPostComment) {
            throw new AccessDeniedException($this->get('translator')->trans('comment.error.not_author', array(), 'CapcoAppBundle'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($comment);
                $em->flush();

                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('comment.delete.success'));

                return $this->redirect($this->get('capco.comment.resolver')->getUrlOfRelatedObject($comment));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('comment.delete.error'));
            }
        }

        return [
            'form' => $form->createView(),
            'comment' => $comment,
        ];
    }
}
