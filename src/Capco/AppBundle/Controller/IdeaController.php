<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Entity\IdeaVote;
use Capco\AppBundle\Form\IdeaType;
use Capco\AppBundle\Form\IdeaUpdateType;
use Capco\AppBundle\Form\IdeaVoteType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class IdeaController extends Controller
{
    /**
     * @Route("/ideas/new", name="app_idea_create")
     * @Template()
     * @param $request
     * @return array
     */
    public function createAction(Request $request)
    {
        if (!$this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $idea = new Idea;

        if ($this->getUser()) {
            $idea->setAuthor($this->getUser());
        }

        $form = $this->createForm(new IdeaType(), $idea);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();
                $em->persist($idea);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your idea has been saved'));
                return $this->redirect($this->generateUrl('app_idea_show', array('slug' => $idea->getSlug())));
            }

        }

        return array('form' => $form->createView());
    }

    /**
     * @Route("/ideas/{slug}/delete", name="app_idea_delete")
     * @Template()
     * @param $request
     * @param $idea
     * @return array
     */
    public function deleteAction(Idea $idea, Request $request)
    {

        if (!$this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostIdea = $idea->getAuthor()->getId();

        if ($userCurrent !== $userPostIdea) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot delete this contribution'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                //vérifie donc que le CSRF
                $em = $this->getDoctrine()->getManager();
                $em->remove($idea);
                $em->flush();
                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('The idea has been deleted'));

                return $this->redirect($this->generateUrl('app_idea', array()));
            }
        }

        return array(
            'idea' => $idea,
            'form' => $form->createView()
        );
    }

    /**
     * @Route("/ideas/{page}", name="app_idea", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Route("/ideas/page/{page}", name="app_idea_filtered", requirements={"page" = "\d+"}, defaults={"page" = 1} )
     * @Cache(expires="+1 minutes", maxage="60", smaxage="60", public="true")
     * @Template()
     * @param $page
     * @return array
     */
    public function indexAction($page)
    {
        $em = $this->getDoctrine()->getManager();
        $ideas = $em->getRepository('CapcoAppBundle:Idea')->getIdeasWithUser(8, $page);

        return array(
            'ideas' => $ideas,
            'page' => $page,
            'nbPage' => ceil(count($ideas) / 8)
        );
    }

    /**
     * @Route("/idea/{slug}", name="app_idea_show")
     * @Template()
     * @param Idea $idea
     * @return array
     */
    public function showAction(Idea $idea)
    {
        $em = $this->getDoctrine()->getManager();
        $currentUrl = $this->generateUrl('app_idea_show', [ 'slug' => $idea->getSlug() ]);
        $translator = $this->get('translator');
        $idea = $em->getRepository('CapcoAppBundle:Idea')->getOneIdeaWithUserAndTheme($idea);

        if ($this->get('security.context')->isGranted('ROLE_USER')) {
            $userVoteCount = $em->getRepository('CapcoAppBundle:IdeaVote')->countForUserAndIdea($this->getUser(), $idea);
        } else {
            $userVoteCount = 0;
        }

        $form = $this->createForm(new IdeaVoteType(), $idea, array(
            'action' => $currentUrl,
            'method' => 'POST'
        ));
        $request = $this->getRequest();

        if ($request->getMethod() == 'POST') {
            if (!$this->get('security.context')->isGranted('ROLE_USER')) {
                throw new AccessDeniedException($translator->trans('Please log in or create an account to vote for this idea!'));
            }

            $form->handleRequest($request);

            if ($form->isValid()) {
                if ($userVoteCount == 0) {
                    $vote = new IdeaVote();
                    $vote->setVoter($this->getUser());
                    $vote->setIdea($idea);
                    $idea->addIdeaVote($vote);
                    $em->persist($idea);
                    $em->flush();

                    $this->get('session')->getFlashBag()->add('success', $translator->trans('Your vote has been saved.'));
                } else {
                    $this->get('session')->getFlashBag()->add('error', $translator->trans('You have already voted for this idea.'));
                }

                // redirect (avoids reload alerts)
                return $this->redirect($currentUrl);
            }
        }

        return array(
            'idea' => $idea,
            'userVoteCount' => $userVoteCount,
            'form' => $form->createView()
        );
    }

    /**
     * @Route("/ideas/{slug}/edit", name="app_idea_update")
     * @Template()
     * @param $request
     * @param $idea
     * @return array
     */
    public function updateAction(Idea $idea,  Request $request)
    {
        if (!$this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostIdea = $idea->getAuthor()->getId();

        if ($userCurrent !== $userPostIdea) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot edit this idea, as you are not its author'));
        }

        $form = $this->createForm(new IdeaUpdateType(), $idea);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($idea);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('The idea has been edited'));

                return $this->redirect($this->generateUrl('app_idea_show', array('slug' => $idea->getSlug())));
            }
        }

        return array(
            'form' => $form->createView(),
            'idea' => $idea
        );
    }
}
