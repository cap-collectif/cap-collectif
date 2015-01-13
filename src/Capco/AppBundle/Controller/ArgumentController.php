<?php

namespace Capco\AppBundle\Controller;

use Capco\AppBundle\Entity\Argument;
use Capco\AppBundle\Entity\Consultation;
use Capco\AppBundle\Entity\Opinion;
use Capco\AppBundle\Entity\OpinionType;
use Capco\AppBundle\Entity\ArgumentVote;

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

class ArgumentController extends Controller
{

    /**
     * @Template("CapcoAppBundle:Argument:show_arguments.html.twig")
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

        $reportingArgument = $this->getDoctrine()->getRepository('CapcoAppBundle:Reporting')->findBy(array(
            'Reporter' => $this->getUser(),
            'Argument' => $arguments
        ));

        return [
            'userReportingArgument' => $reportingArgument,
            'arguments' => $arguments,
            'argumentType' => $argumentType,
            'consultation' => $consultation,
            'opinionType' => $opinionType,
            'opinion' => $opinion
        ];
    }

    /**
     * @Route("/consultation/{consultation_slug}/{opinion_type_slug}/{opinion_slug}/argument/vote/{argument_id}", name="app_consultation_vote_argument")
     * @ParamConverter("consultation", class="CapcoAppBundle:Consultation", options={"mapping": {"consultation_slug": "slug"}})
     * @ParamConverter("opinionType", class="CapcoAppBundle:OpinionType", options={"mapping": {"opinion_type_slug": "slug"}})
     * @ParamConverter("opinion", class="CapcoAppBundle:Opinion", options={"mapping": {"opinion_slug": "slug"}})
     * @ParamConverter("argument", class="CapcoAppBundle:Argument", options={"mapping": {"argument_id": "id"}})
     *
     * @param $request
     * @param $consultation
     * @param $opinionType
     * @param $opinion
     * @param $argument
     * @return array
     */
    public function voteOnArgumentAction(Consultation $consultation, OpinionType $opinionType, Opinion $opinion, Argument $argument, Request $request)
    {
        if (false === $this->get('security.authorization_checker')->isGranted('ROLE_USER')) {
            throw new AccessDeniedException($this->get('translator')->trans('Access restricted to authenticated users'));
        }

        $user = $this->getUser();

        if ($request->getMethod() == 'POST') {

            if($this->isCsrfTokenValid('argument_vote', $request->get('_csrf_token'))) {

                $em = $this->getDoctrine()->getManager();

                $argumentVote = new ArgumentVote();
                $argumentVote->setVoter($user);
                $argumentVote->setArgument($argument);

                $userVote = $em->getRepository('CapcoAppBundle:ArgumentVote')->findOneBy(array(
                        'Voter' => $user,
                        'argument' => $argument
                    ));

                if( $userVote != null ){
                    $argumentVote = $userVote;
                }

                if($userVote == null ){
                    $argument->addVote();
                    $em->persist($argument);
                    $em->persist($argumentVote);
                    $em->flush();

                    $this->get('session')->getFlashBag()->add('success', $this->get('translator')->trans('Your vote has been saved.'));
                }
                else {
                    $argument->removeVote();
                    $em->persist($argument);
                    $em->remove($argumentVote);
                    $em->flush();

                    $this->get('session')->getFlashBag()->add('info', $this->get('translator')->trans('Your vote has been removed.'));
                }
            }
            else {
                $this->get('session')->getFlashBag()->add('danger', $this->get('translator')->trans('Authentication error.'));
            }
        }

        return $this->redirect($this->generateUrl('app_consultation_show_opinion', ['consultation_slug' => $consultation->getSlug(), 'opinion_type_slug' => $opinionType->getSlug(), 'opinion_slug' => $opinion->getSlug() ]));
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
