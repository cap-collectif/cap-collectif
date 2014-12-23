<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Form\OpinionsType as OpinionForm;
use Capco\AppBundle\Form\ArgumentType as ArgumentForm;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Cache;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Form\Form;

class OpinionController extends Controller
{

    /**
     * Page opinion
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{opinion_slug}", name="app_consultation_show_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @Template("CapcoAppBundle:Opinion:show.html.twig")
     * @param Consultation $consultation
     * @param OpinionType $opinionType
     * @param Opinion $opinion
     * @param Request $request
     * @return array
     */
    public function showOpinionAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Request $request)
    {
        if (false === $opinion->getIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $currentUrl = $this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]);
        $opinion = $this->getDoctrine()->getRepository('CapcoAppBundle:Opinion')->getOpinionWithArguments($opinion->getSlug());
        $Votes = $this->getDoctrine()->getRepository('CapcoAppBundle:OpinionVote')->getByOpinion($opinion->getSlug());

        // Argument forms
        $argument = new Argument();
        $argument->setOpinion($opinion);
        $argument->setAuthor($this->getUser());
        
        $argumentFormYes = $this->get('form.factory')->createNamedBuilder('argumentFormYes', new ArgumentForm(), $argument)->getForm();
        $argumentFormNo = $this->get('form.factory')->createNamedBuilder('argumentFormNo', new ArgumentForm(), $argument)->getForm();

        if ('POST' === $request->getMethod()) {

            $form = null;
 
            if ($request->request->has('argumentFormYes')) {
                $argument->setType(Argument::TYPE_FOR);
                $form = $argumentFormYes;
            }
     
            if ($request->request->has('argumentFormNo')) {
                $argument->setType(Argument::TYPE_AGAINST);
                $form = $argumentFormNo;
            }


            if ($this->handleCreateArgumentForm($opinion, $argument, $form, $request)) {

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your argument has been saved'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
            } else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('Your argument has not been saved.'));
            }

        }

        return [
            'currentUrl' => $currentUrl,
            'consultation' => $consultation,
            'opinion' => $opinion,
            'votes' => $Votes,
            'argumentFormYes' => $argumentFormYes->createView(),
            'argumentFormNo' => $argumentFormNo->createView(),
            'argumentTypes' => Argument::$argumentTypes,
        ];
    }

    /**
     * @Template("CapcoAppBundle:Opinion:show_arguments.html.twig")
     * @param $consultation
     * @param $opinionType
     * @param $opinion
     * @param $type
     * @return array
     */
    public function showArgumentsAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, $type)
    {
        $argumentType = Argument::$argumentTypes[$type];

        $arguments = $this->getDoctrine()->getRepository('CapcoAppBundle:Argument')->findBy(
            array('type' => $type, 'opinion' => $opinion)
        );

        return [
            'arguments' => $arguments,
            'argumentType' => $argumentType,
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'opinion' => $opinion
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/add", name="app_consultation_new_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @param $opinionType
     * @param $consultation
     * @param $request
     * @Template("CapcoAppBundle:Opinion:create.html.twig")
     * @return array
     */
    public function createOpinionAction(Consultation $consultation, OpinionType $opinionType, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false === $opinionType->isIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $opinion = new Opinion();
        $opinion->setConsultation($consultation);
        $opinion->setAuthor($this->getUser());
        $opinion->setOpinionType($opinionType);
        $opinion->setIsEnabled(true);

        $form = $this->createForm(new OpinionForm(), $opinion);

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->persist($opinion);
                $em->flush();
                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your proposition has been saved'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
            }
        }

        return [
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'form' => $form->createView()
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/delete/{opinion_slug}", name="app_consultation_delete_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @param $opinionType
     * @param $consultation
     * @param $request
     * @param $opinion
     * @Template("CapcoAppBundle:Opinion:delete.html.twig")
     * @return array
     */
    public function deleteOpinionAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        if (false === $opinionType->isIsEnabled()) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostOpinion = $opinion->getAuthor()->getId();

        if ($userCurrent !== $userPostOpinion) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot delete this contribution'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {
                $em = $this->getDoctrine()->getManager();
                $em->remove($opinion);
                $em->flush();

                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('The proposition has been deleted'));
                return $this->redirect($this->generateUrl('app_consultation_show', ['slug' => $consultation->getSlug() ]));
            }
        }

        return array(
            'opinion' => $opinion,
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'form' => $form->createView()
        );
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/edit/{opinion_slug}", name="app_consultation_edit_opinion")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @Template("CapcoAppBundle:Opinion:update.html.twig")
     * @param $request
     * @param $consultation
     * @param $opinionType
     * @param $opinion
     * @return array
     */
    public function updateOpinionAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostOpinion = $opinion->getAuthor()->getId();

        if ($userCurrent !== $userPostOpinion) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot edit this opinion, as you are not its author'));
        }

        $form = $this->createForm(new OpinionForm(), $opinion);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();

                // Get votes on opinion
                $linkedVotes = $em->getRepository('CapcoAppBundle:OpinionVote')->findByOpinion($opinion);

                foreach($linkedVotes as $vote){
                    $em->remove($vote);
                }

                $opinion->resetVotes();
                $em->persist($opinion);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('The opinion has been edited'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
            }
        }

        return [
            'form' => $form->createView(),
            'opinion' => $opinion,
            'consultation' => $consultation,
            'opinionType' => $opinionType
        ];
    }

    /**
     * Argument CRUD
     * @Template("CapcoAppBundle:Argument:create.html.twig")
     * @param $opinion
     * @param $argument
     * @param $form
     * @param $request
     * @return array
     */
    private function handleCreateArgumentForm(Opinion $opinion, Argument $argument, Form $form, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $form->handleRequest($request);

        if ($form->isValid()) {

            $em = $this->getDoctrine()->getManager();
            $em->persist($argument);
            $em->flush();
            return true;
        }

        return false;
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{opinion_slug}/argument/edit/{argument_id}", name="app_consultation_edit_argument")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @ParamConverter("argument", class="CapcoAppBundle:Argument", options={"mapping": {"argument_id": "id"}})
     * @Template("CapcoAppBundle:Argument:update.html.twig")
     *
     * @param $request
     * @param $consultation
     * @param $opinionType
     * @param $opinion
     * @param $argument
     * @return array
     */
    public function updateArgumentAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Argument $argument, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostArgument = $argument->getAuthor()->getId();

        if ($userCurrent !== $userPostArgument) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot edit this argument, as you are not its author.'));
        }

        $form = $this->createForm(new ArgumentForm(), $argument);
        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();

                // Get votes on argument
                $linkedVotes = $em->getRepository('CapcoAppBundle:ArgumentVote')->findByArgument($argument);

                foreach($linkedVotes as $vote){
                    $em->remove($vote);
                }

                $argument->resetVotes();
                $em->persist($argument);
                $em->flush();

                $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('The argument has been edited'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
            }
        }

        return [
            'form' => $form->createView(),
            'argument' => $argument,
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'opinion' => $opinion,
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{opinion_slug}/argument/delete/{argument_id}", name="app_consultation_delete_argument")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @ParamConverter("argument", class="CapcoAppBundle:Argument", options={"mapping": {"argument_id": "id"}})
     * @Template("CapcoAppBundle:Argument:delete.html.twig")
     * @param $request
     * @param $consultation
     * @param $opinionType
     * @param $opinion
     * @param $argument
     * @return array
     */
    public function deleteArgumentAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Argument $argument, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $userCurrent = $this->getUser()->getId();
        $userPostArgument = $argument->getAuthor()->getId();

        if ($userCurrent !== $userPostArgument) {
            throw new AccessDeniedException($this->get('translator')->trans('You cannot delete this argument.'));
        }

        //Champ CSRF
        $form = $this->createFormBuilder()->getForm();

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $em = $this->getDoctrine()->getManager();
                $em->remove($argument);
                $em->flush();

                $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('The argument has been deleted.'));
                return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
            }
        }

        return [
            'form' => $form->createView(),
            'argument' => $argument,
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'opinion' => $opinion,
        ];
    }
}
