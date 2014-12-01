<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Idea;
use Capco\AppBundle\Form\IdeaType;
use Capco\AppBundle\Form\IdeaUpdateType;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class IdeaController extends Controller
{

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
        $idea = $em->getRepository('CapcoAppBundle:Idea')->getOneIdeaWithUserAndTheme($idea);

        return array(
            'idea' => $idea
        );
    }

    /**
     * @Route("/ideas/new", name="app_idea_create")
     * @Template()
     * @param $request
     * @return array
     */
    public function createAction(Request $request)
    {

        if (!$this->get('security.context')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException("Accès limité aux utilisateurs connectés");
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
                $this->get('session')->getFlashBag()->add('success', 'Votre idée à bien été enregistré');
                return $this->redirect($this->generateUrl('app_idea_show', array('slug' => $idea->getSlug())));
            }

        }

        return array('form' => $form->createView());

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
            throw new AccessDeniedException("Accès limité aux utilisateurs connectés");
        }

        $userCurrent = $this->getUser()->getId();
        $userPostIdea = $idea->getAuthor()->getId();

        if ($userCurrent !== $userPostIdea) {
            throw new AccessDeniedException("vous ne pouvez pas modifier cette contribution car vous en êtes pas l'auteur");
        }

        $form = $this->createForm(new IdeaUpdateType(), $idea);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($idea);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', 'l\'idée à bien été modifié');

                return $this->redirect($this->generateUrl('app_idea_show', array('slug' => $idea->getSlug())));
            }
        }

        return array(
            'form' => $form->createView(),
            'idea' => $idea
        );
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
            throw new AccessDeniedException("Accès limité aux utilisateurs connectés");
        }

        $userCurrent = $this->getUser()->getId();
        $userPostIdea = $idea->getAuthor()->getId();

        if ($userCurrent !== $userPostIdea) {
            throw new AccessDeniedException("vous ne pouvez pas supprimer cette contribution");
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
                $this->get('session')->getFlashBag()->add('info', 'L\'idée à bien été supprimé');

                return $this->redirect($this->generateUrl('app_idea', array()));
            }
        }

        return array(
            'idea' => $idea,
            'form' => $form->createView()
        );
    }

}
